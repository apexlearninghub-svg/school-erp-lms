from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt,
    set_access_cookies, set_refresh_cookies,
    unset_jwt_cookies
)
from app import db, bcrypt
from app.models import User, UserRole
from app.utils.validators import (
    sanitize_string, is_valid_email, is_valid_username,
    is_strong_password, validate_role
)
from app.utils.audit import log_login_history, log_audit
from app import limiter

auth_bp = Blueprint("auth", __name__)


def make_tokens(user_id: str, additional_claims: dict = None):
    """Create access + refresh JWT tokens."""
    claims = additional_claims or {}
    access_token = create_access_token(identity=user_id, additional_claims=claims)
    refresh_token = create_refresh_token(identity=user_id)
    return access_token, refresh_token


# ─── Register ──────────────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per hour")
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    full_name = sanitize_string(data.get("full_name", ""), 255)
    email = sanitize_string(data.get("email", ""), 255).lower()
    username = sanitize_string(data.get("username", ""), 100).lower()
    password = data.get("password", "")
    role = sanitize_string(data.get("role", UserRole.STUDENT), 50).lower()

    # Validations
    errors = {}
    if not full_name:
        errors["full_name"] = "Full name is required"
    if not is_valid_email(email):
        errors["email"] = "Invalid email address"
    if not is_valid_username(username):
        errors["username"] = "Username must be 3-30 characters (letters, numbers, _ or -)"
    password_valid, password_msg = is_strong_password(password)
    if not password_valid:
        errors["password"] = password_msg
    if not validate_role(role):
        errors["role"] = f"Role must be one of: {', '.join(UserRole.ALL)}"
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 422

    # Check duplicates
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username is already taken"}), 409

    # Create user
    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(
        full_name=full_name,
        email=email,
        username=username,
        password_hash=password_hash,
        role=role,
        is_verified=False,
        is_active=True,
    )
    db.session.add(user)
    db.session.commit()

    # Automatically create Student/Teacher Profiles
    from app.models import Student, Teacher, Class
    if role == UserRole.STUDENT:
        # Assign a default class if available, or create it
        cls = Class.query.filter_by(name="Class 10").first()
        if not cls:
            cls = Class(name="Class 10")
            db.session.add(cls)
            db.session.commit()
        
        student = Student(user_id=user.id, class_id=cls.id)
        db.session.add(student)
        db.session.commit()
    elif role == UserRole.TEACHER:
        teacher = Teacher(user_id=user.id, employee_id=f"TCH{user.username.upper()}")
        db.session.add(teacher)
        db.session.commit()

    # Create and send verification OTP
    import random
    from app.utils.mail_templates import send_otp_email
    from app.models import EmailVerification
    import datetime
    from datetime import timezone

    otp = f"{random.randint(100000, 999999)}"
    expires_at = datetime.datetime.now(timezone.utc) + datetime.timedelta(minutes=5)
    
    ev = EmailVerification(
        user_id=user.id,
        otp=otp,
        expires_at=expires_at,
        attempts=0,
        verified=False
    )
    db.session.add(ev)
    db.session.commit()
    
    send_otp_email(user.email, otp, user.full_name, "email_verification")

    log_audit(user.id, "USER_REGISTERED", {"email": email, "role": role})

    return jsonify({
        "message": "Registration successful. Please verify your email using the OTP sent to your email address.",
        "user_id": user.id,
        "email": email
    }), 201


# ─── Helper for OTP Generation ───────────────────────────────────────────────

def create_otp_token(user, purpose="email_verification"):
    import random
    import datetime
    from datetime import timezone
    from app.models import EmailVerification
    from app.utils.mail_templates import send_otp_email

    # Expire active verification attempts
    EmailVerification.query.filter_by(user_id=user.id, verified=False).update(
        {"expires_at": datetime.datetime.now(timezone.utc)}
    )
    
    otp = f"{random.randint(100000, 999999)}"
    expires_at = datetime.datetime.now(timezone.utc) + datetime.timedelta(minutes=5)
    
    ev = EmailVerification(
        user_id=user.id,
        otp=otp,
        expires_at=expires_at,
        attempts=0,
        verified=False
    )
    db.session.add(ev)
    db.session.commit()
    
    send_otp_email(user.email, otp, user.full_name, purpose)
    return otp


# ─── Login ─────────────────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per 15 minutes")
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    identifier = sanitize_string(data.get("identifier", ""), 255)  # email or username
    password = data.get("password", "")
    remember_me = bool(data.get("remember_me", False))

    if not identifier or not password:
        return jsonify({"error": "Username/email and password are required"}), 400

    # Find user by email or username
    user = None
    if is_valid_email(identifier):
        user = User.query.filter_by(email=identifier.lower()).first()
    else:
        user = User.query.filter_by(username=identifier.lower()).first()

    if not user or not user.password_hash:
        log_login_history(user.id if user else "unknown", success=False)
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.check_password_hash(user.password_hash, password):
        log_login_history(user.id, success=False)
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_verified:
        return jsonify({"error": "Verify Your Email First", "email": user.email}), 403

    if not user.is_active:
        return jsonify({"error": "Your account has been deactivated. Please contact support."}), 403

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()

    access_token, refresh_token = make_tokens(user.id, {"role": user.role})
    log_login_history(user.id, success=True, method="password")
    log_audit(user.id, "USER_LOGIN", {"method": "password", "remember_me": remember_me})

    response = jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
        "redirect_url": user.get_dashboard_url(),
    })
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200


# ─── Google OAuth ───────────────────────────────────────────────────────────────

@auth_bp.route("/google-login", methods=["POST"])
@limiter.limit("20 per hour")
def google_login():
    """Verify Google ID token and create/login user."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    google_token = data.get("token", "")
    role = sanitize_string(data.get("role", UserRole.STUDENT), 50).lower()

    if not google_token:
        return jsonify({"error": "Google token is required"}), 400

    if not validate_role(role):
        return jsonify({"error": f"Role must be one of: {', '.join(UserRole.ALL)}"}), 422

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        client_id = current_app.config.get("GOOGLE_CLIENT_ID")
        if not client_id:
            return jsonify({"error": "Google OAuth is not configured"}), 503

        id_info = id_token.verify_oauth2_token(
            google_token,
            google_requests.Request(),
            client_id,
        )

        google_id = id_info.get("sub")
        email = id_info.get("email", "").lower()
        full_name = id_info.get("name", "")
        avatar = id_info.get("picture", "")

        # Find or create user
        user = User.query.filter_by(google_id=google_id).first()
        if not user:
            user = User.query.filter_by(email=email).first()

        if user:
            # Update Google ID if not set
            if not user.google_id:
                user.google_id = google_id
            if avatar and not user.avatar:
                user.avatar = avatar
        else:
            # Create new user
            base_username = email.split("@")[0].replace(".", "_")
            username = base_username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                full_name=full_name,
                email=email,
                username=username,
                google_id=google_id,
                avatar=avatar,
                role=role,
                is_verified=True,  # Google accounts are pre-verified
                is_active=True,
            )
            db.session.add(user)

        user.last_login = datetime.now(timezone.utc)
        db.session.commit()

        access_token, refresh_token = make_tokens(user.id, {"role": user.role})
        log_login_history(user.id, success=True, method="google")
        log_audit(user.id, "USER_LOGIN", {"method": "google"})

        response = jsonify({
            "message": "Google login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict(),
            "redirect_url": user.get_dashboard_url(),
        })
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        return response, 200

    except ValueError as e:
        return jsonify({"error": "Invalid Google token", "detail": str(e)}), 401
    except Exception as e:
        current_app.logger.error(f"Google login error: {e}")
        return jsonify({"error": "Google authentication failed"}), 500


# ─── Logout ────────────────────────────────────────────────────────────────────

@auth_bp.route("/logout", methods=["POST"])
@jwt_required(optional=True)
def logout():
    user_id = get_jwt_identity()
    if user_id:
        log_audit(user_id, "USER_LOGOUT")

    response = jsonify({"message": "Logged out successfully"})
    unset_jwt_cookies(response)
    return response, 200


# ─── Refresh Token ─────────────────────────────────────────────────────────────

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return jsonify({"error": "User not found or inactive"}), 404

    access_token = create_access_token(
        identity=user_id,
        additional_claims={"role": user.role}
    )
    response = jsonify({
        "access_token": access_token,
        "user": user.to_dict(),
    })
    set_access_cookies(response, access_token)
    return response, 200


# ─── Profile (via JWT) ─────────────────────────────────────────────────────────

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


# ─── Forgot Password ───────────────────────────────────────────────────────────

@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("3 per 15 minutes")
def forgot_password():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    email = sanitize_string(data.get("email", ""), 255).lower()
    if not is_valid_email(email):
        return jsonify({"error": "Invalid email address"}), 422

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No account associated with this email address was found."}), 404

    if not user.is_active:
        return jsonify({"error": "This account is currently deactivated."}), 403

    # Generate OTP and email it
    create_otp_token(user, purpose="password_reset")
    log_audit(user.id, "PASSWORD_RESET_REQUESTED", {"email": email})

    return jsonify({
        "message": "OTP code has been sent to your email address.",
        "email": email
    }), 200


# ─── Reset Password ────────────────────────────────────────────────────────────

@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("5 per hour")
def reset_password():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    reset_token = data.get("reset_token", "")
    new_password = data.get("new_password", "")

    if not reset_token or not new_password:
        return jsonify({"error": "Reset token and new password are required"}), 400

    # Verify reset token
    try:
        from flask_jwt_extended import decode_token
        decoded = decode_token(reset_token)
        if decoded.get("purpose") != "password_reset":
            raise ValueError("Invalid token purpose")
        user_id = decoded.get("sub")
    except Exception:
        return jsonify({"error": "Invalid or expired reset token"}), 401

    password_valid, password_msg = is_strong_password(new_password)
    if not password_valid:
        return jsonify({"error": password_msg}), 422

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()

    log_audit(user.id, "PASSWORD_RESET_COMPLETED")
    return jsonify({"message": "Password reset successfully. You can now log in."}), 200


# ─── Change Password ───────────────────────────────────────────────────────────

@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"error": "Current password and new password are required."}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    if not user.password_hash or not bcrypt.check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Incorrect current password."}), 401

    password_valid, password_msg = is_strong_password(new_password)
    if not password_valid:
        return jsonify({"error": password_msg}), 422

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()

    log_audit(user.id, "PASSWORD_CHANGED")
    return jsonify({"message": "Password updated successfully."}), 200


# ─── OTP Validation Endpoints ────────────────────────────────────────────────

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp_route():
    data = request.get_json(silent=True) or {}
    email = sanitize_string(data.get("email", ""), 255).lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found."}), 404
        
    create_otp_token(user, purpose="email_verification")
    return jsonify({"message": "OTP sent successfully."}), 200


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp_route():
    from app.models import EmailVerification
    data = request.get_json(silent=True) or {}
    email = sanitize_string(data.get("email", ""), 255).lower()
    otp = sanitize_string(data.get("otp", ""), 10)
    purpose = sanitize_string(data.get("purpose", "email_verification"), 50)
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found."}), 404
        
    # Find latest unverified OTP for this user
    from datetime import datetime, timezone
    ev = EmailVerification.query.filter_by(user_id=user.id, verified=False).order_by(EmailVerification.created_at.desc()).first()
    
    if not ev:
        return jsonify({"error": "No active OTP verification session found. Please request a new OTP."}), 404
        
    if ev.attempts >= 5:
        return jsonify({"error": "Maximum verification attempts exceeded. Please request a new OTP."}), 400
        
    ev.attempts += 1
    db.session.commit()
    
    if ev.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return jsonify({"error": "OTP has expired. Please request a new one."}), 400
        
    if ev.otp != otp:
        return jsonify({"error": "Invalid OTP code. Please try again."}), 400
        
    ev.verified = True
    
    if purpose == "email_verification":
        user.is_verified = True
        
    db.session.commit()
    
    # If password reset, generate a reset token
    reset_token = None
    if purpose == "password_reset":
        reset_token = create_access_token(
            identity=user.id,
            additional_claims={"purpose": "password_reset"}
        )
        
    return jsonify({
        "message": "OTP verified successfully.",
        "reset_token": reset_token
    }), 200


@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp_route():
    data = request.get_json(silent=True) or {}
    email = sanitize_string(data.get("email", ""), 255).lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found."}), 404
    
    create_otp_token(user, purpose="email_verification")
    return jsonify({"message": "A new OTP code has been sent to your email address."}), 200

# Trigger reload for SMTP env updates



