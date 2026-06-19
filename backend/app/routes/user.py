import os
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from PIL import Image
from app import db
from app.models import User, LoginHistory, AuditLog, Admission, Student, Teacher, Class
from app.utils.validators import sanitize_string, is_valid_email, validate_role
from app.utils.audit import log_audit

user_bp = Blueprint("user", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ─── Get Profile ───────────────────────────────────────────────────────────────

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


# ─── Update Profile ────────────────────────────────────────────────────────────

@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    errors = {}

    if "full_name" in data:
        full_name = sanitize_string(data["full_name"], 255)
        if not full_name:
            errors["full_name"] = "Full name cannot be empty"
        else:
            user.full_name = full_name

    if "email" in data:
        email = sanitize_string(data["email"], 255).lower()
        if not is_valid_email(email):
            errors["email"] = "Invalid email address"
        elif email != user.email:
            if User.query.filter_by(email=email).filter(User.id != user_id).first():
                errors["email"] = "Email already in use"
            else:
                user.email = email
                user.is_verified = False  # Re-verify on email change

    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 422

    db.session.commit()
    log_audit(user_id, "PROFILE_UPDATED")
    return jsonify({"message": "Profile updated successfully", "user": user.to_dict()}), 200


# ─── Avatar Upload ─────────────────────────────────────────────────────────────

@user_bp.route("/avatar", methods=["POST"])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if "avatar" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["avatar"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP"}), 400

    filename = secure_filename(f"avatar_{user_id}.jpg")
    upload_path = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_path, exist_ok=True)
    filepath = os.path.join(upload_path, filename)

    try:
        img = Image.open(file)
        img = img.convert("RGB")
        img.thumbnail((400, 400))  # Resize to max 400x400
        img.save(filepath, "JPEG", quality=85)
    except Exception as e:
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 400

    user.avatar = f"/api/user/avatar/{filename}"
    db.session.commit()
    log_audit(user_id, "AVATAR_UPDATED")

    return jsonify({
        "message": "Avatar uploaded successfully",
        "avatar_url": user.avatar,
    }), 200


# ─── Serve Avatar ──────────────────────────────────────────────────────────────

@user_bp.route("/avatar/<filename>", methods=["GET"])
def serve_avatar(filename: str):
    upload_path = current_app.config["UPLOAD_FOLDER"]
    return send_from_directory(upload_path, filename)


# ─── Login History ─────────────────────────────────────────────────────────────

@user_bp.route("/login-history", methods=["GET"])
@jwt_required()
def login_history():
    user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    history = LoginHistory.query.filter_by(user_id=user_id)\
        .order_by(LoginHistory.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "history": [h.to_dict() for h in history.items],
        "total": history.total,
        "pages": history.pages,
        "page": page,
    }), 200


# ─── Audit Logs ────────────────────────────────────────────────────────────────

@user_bp.route("/audit-logs", methods=["GET"])
@jwt_required()
def audit_logs():
    user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    logs = AuditLog.query.filter_by(user_id=user_id)\
        .order_by(AuditLog.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "logs": [log.to_dict() for log in logs.items],
        "total": logs.total,
        "pages": logs.pages,
        "page": page,
    }), 200


# ─── Submit Admission Form ─────────────────────────────────────────────────────

def save_base64_file(base64_str, folder, prefix):
    import base64
    import uuid
    if not base64_str or not isinstance(base64_str, str) or not base64_str.startswith("data:"):
        return base64_str
    try:
        header, data = base64_str.split(",", 1)
        mime_type = header.split(";")[0].split(":")[1]
        ext = mime_type.split("/")[1]
        
        mime_map = {
            "jpeg": "jpg",
            "png": "png",
            "pdf": "pdf",
            "msword": "doc",
            "vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
        }
        ext = mime_map.get(ext.lower(), ext)
        
        file_bytes = base64.b64decode(data)
        filename = f"{prefix}_{uuid.uuid4().hex[:10]}.{ext}"
        filepath = os.path.join(folder, filename)
        os.makedirs(folder, exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(file_bytes)
        return f"/api/user/avatar/{filename}"
    except Exception as e:
        current_app.logger.error(f"Failed to save base64 file: {e}")
        return None

@user_bp.route("/admission", methods=["POST"])
@jwt_required()
def submit_admission():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if already submitted
    if user.admission:
        import sys
        print("ERROR: Admission already submitted", file=sys.stderr)
        return jsonify({"error": "Admission form already submitted"}), 400

    data = request.get_json(silent=True)
    if not data:
        import sys
        print("ERROR: Invalid JSON body (payload too large or malformed)", file=sys.stderr)
        return jsonify({"error": "Invalid JSON body or payload too large"}), 400

    # Common fields
    student_name = sanitize_string(data.get("student_name", ""), 255)
    father_name = sanitize_string(data.get("father_name", ""), 255)
    mother_name = sanitize_string(data.get("mother_name", ""), 255)
    email = sanitize_string(data.get("email", ""), 255).lower()
    phone = sanitize_string(data.get("phone", ""), 50)
    dob = sanitize_string(data.get("dob", ""), 50)
    gender = sanitize_string(data.get("gender", ""), 20)
    blood_group = sanitize_string(data.get("blood_group", ""), 20)
    address = sanitize_string(data.get("address", ""), 2000)

    # Teacher specific fields
    employee_id = sanitize_string(data.get("employee_id", ""), 100)
    designation = sanitize_string(data.get("designation", ""), 100)
    department = sanitize_string(data.get("department", ""), 100)
    joining_date = sanitize_string(data.get("joining_date", ""), 100)
    experience = sanitize_string(data.get("experience", ""), 100)
    specialization = sanitize_string(data.get("specialization", ""), 100)

    # Education fields
    highest_qualification = sanitize_string(data.get("highest_qualification", ""), 100)
    university = sanitize_string(data.get("university", ""), 100)
    graduation_year = sanitize_string(data.get("graduation_year", ""), 50)
    certifications = sanitize_string(data.get("certifications", ""), 2000)

    # Emergency Contact fields
    emergency_name = sanitize_string(data.get("emergency_name", ""), 255)
    emergency_phone = sanitize_string(data.get("emergency_phone", ""), 50)
    emergency_relation = sanitize_string(data.get("emergency_relation", ""), 100)

    # Student specific fields
    class_applied = sanitize_string(data.get("class_applied", ""), 100)
    previous_gpa = sanitize_string(data.get("previous_gpa", ""), 50)
    guardian_name = sanitize_string(data.get("guardian_name", ""), 255)

    # Validate based on role
    errors = {}
    if not student_name:
        errors["student_name"] = "Full name is required"
    if not email or not is_valid_email(email):
        errors["email"] = "Valid email is required"
    if not phone:
        errors["phone"] = "Phone number is required"
    if not dob:
        errors["dob"] = "Date of birth is required"
    if not gender:
        errors["gender"] = "Gender is required"
    if not address:
        errors["address"] = "Address is required"

    if user.role == "teacher":
        if not employee_id:
            errors["employee_id"] = "Employee ID is required"
        if not designation:
            errors["designation"] = "Designation is required"
        if not department:
            errors["department"] = "Department/Subject is required"
        if not joining_date:
            errors["joining_date"] = "Joining date is required"
        if not experience:
            errors["experience"] = "Total experience is required"
        if not highest_qualification:
            errors["highest_qualification"] = "Highest qualification is required"
        if not university:
            errors["university"] = "University/Institution is required"
        if not graduation_year:
            errors["graduation_year"] = "Year of graduation is required"
        if not emergency_name:
            errors["emergency_name"] = "Emergency contact name is required"
        if not emergency_phone:
            errors["emergency_phone"] = "Emergency contact phone is required"
        if not emergency_relation:
            errors["emergency_relation"] = "Emergency relation is required"
        if not data.get("photo"):
            errors["photo"] = "Profile photo is required"
        if not data.get("aadhaar_card"):
            errors["aadhaar_card"] = "Aadhaar Card is required"
    else:
        # Student validations
        if not class_applied:
            errors["class_applied"] = "Class applied for is required"
        if not guardian_name:
            errors["guardian_name"] = "Guardian / Parent name is required"

    if errors:
        import sys
        print("VALIDATION ERRORS:", errors, file=sys.stderr)
        return jsonify({"error": "Validation failed", "details": errors}), 422

    # Process File Uploads (Base64 decoding)
    upload_path = current_app.config["UPLOAD_FOLDER"]
    
    photo_url = save_base64_file(data.get("photo"), upload_path, f"photo_{user_id}")
    aadhaar_url = save_base64_file(data.get("aadhaar_card"), upload_path, f"aadhaar_{user_id}")
    resume_url = save_base64_file(data.get("resume"), upload_path, f"resume_{user_id}")
    pan_url = save_base64_file(data.get("pan_card"), upload_path, f"pan_{user_id}")
    other_url = save_base64_file(data.get("other_docs"), upload_path, f"other_{user_id}")

    # Create record
    admission = Admission(
        user_id=user_id,
        student_name=student_name,
        father_name=father_name,
        mother_name=mother_name,
        email=email,
        phone=phone,
        dob=dob,
        gender=gender,
        blood_group=blood_group,
        address=address,
        employee_id=employee_id if user.role == "teacher" else None,
        designation=designation if user.role == "teacher" else None,
        department=department if user.role == "teacher" else None,
        joining_date=joining_date if user.role == "teacher" else None,
        experience=experience if user.role == "teacher" else None,
        specialization=specialization if user.role == "teacher" else None,
        highest_qualification=highest_qualification if user.role == "teacher" else None,
        university=university if user.role == "teacher" else None,
        graduation_year=graduation_year if user.role == "teacher" else None,
        certifications=certifications if user.role == "teacher" else None,
        emergency_name=emergency_name if user.role == "teacher" else None,
        emergency_phone=emergency_phone if user.role == "teacher" else None,
        emergency_relation=emergency_relation if user.role == "teacher" else None,
        photo=photo_url,
        aadhaar_card=aadhaar_url,
        resume=resume_url,
        pan_card=pan_url,
        other_docs=other_url,
        class_applied=class_applied if user.role != "teacher" else None,
        previous_gpa=previous_gpa if user.role != "teacher" else None,
        guardian_name=guardian_name if user.role != "teacher" else None,
        status="approved"  # Automatically approve so they go straight to dashboard
    )

    db.session.add(admission)

    # Sync admission data to the actual user profile
    if user.role == "student":
        if not user.student_profile:
            user.student_profile = Student(user_id=user.id)
            db.session.add(user.student_profile)
            
        user.student_profile.father_name = father_name
        user.student_profile.mother_name = mother_name
        # If class_applied is provided, try to find or create the class
        if class_applied:
            cls = Class.query.filter_by(name=class_applied).first()
            if not cls:
                cls = Class(name=class_applied)
                db.session.add(cls)
                db.session.flush()
            user.student_profile.class_id = cls.id
        
        # Generate a roll number if not set
        if not user.student_profile.roll_number:
            import random
            user.student_profile.roll_number = f"{datetime.now(timezone.utc).year}-{class_applied[:3].upper() if class_applied else 'GEN'}{random.randint(100, 999)}"

    elif user.role == "teacher":
        if not user.teacher_profile:
            user.teacher_profile = Teacher(user_id=user.id)
            db.session.add(user.teacher_profile)
            
        user.teacher_profile.employee_id = employee_id
        user.teacher_profile.designation = designation
        user.teacher_profile.department = department

    db.session.commit()

    log_audit(user_id, "ADMISSION_FORM_SUBMITTED", {
        "student_name": student_name,
        "role": user.role
    })

    return jsonify({
        "message": "Admission form submitted successfully",
        "user": user.to_dict()
    }), 201
