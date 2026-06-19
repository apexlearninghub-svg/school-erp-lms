import random
import string
from datetime import datetime, timedelta, timezone
from flask import current_app
from flask_mail import Message
from app import mail, db
from app.models import OTPToken


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of given length."""
    return "".join(random.choices(string.digits, k=length))


def create_otp_for_user(user_id: str, purpose: str = "password_reset") -> str:
    """Create and store an OTP token for a user."""
    # Invalidate any existing unused OTPs for same purpose
    existing = OTPToken.query.filter_by(
        user_id=user_id, purpose=purpose, used=False
    ).all()
    for token in existing:
        token.used = True
    db.session.commit()

    otp = generate_otp()
    expiry_minutes = current_app.config.get("OTP_EXPIRY_MINUTES", 10)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expiry_minutes)

    otp_token = OTPToken(
        user_id=user_id,
        token=otp,
        purpose=purpose,
        expires_at=expires_at,
    )
    db.session.add(otp_token)
    db.session.commit()
    return otp


def verify_otp(user_id: str, token: str, purpose: str = "password_reset") -> bool:
    """Verify an OTP token. Returns True if valid, False otherwise."""
    otp_record = OTPToken.query.filter_by(
        user_id=user_id,
        token=token,
        purpose=purpose,
        used=False,
    ).order_by(OTPToken.created_at.desc()).first()

    if not otp_record:
        return False
    if otp_record.is_expired():
        return False

    otp_record.used = True
    db.session.commit()
    return True


def send_otp_email(to_email: str, full_name: str, otp: str, purpose: str = "password_reset"):
    """Send OTP via email."""
    try:
        if purpose == "password_reset":
            subject = "Password Reset OTP - Apex Learning Hub"
            body = _password_reset_email_template(full_name, otp)
        else:
            subject = "Email Verification OTP - Apex Learning Hub"
            body = _email_verify_template(full_name, otp)

        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=body,
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def _password_reset_email_template(name: str, otp: str) -> str:
    return f"""
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #F8FAFC;">
      <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #0EA5A4, #14B8A6); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 28px;">🔐</span>
          </div>
          <h1 style="color: #0F172A; font-size: 24px; font-weight: 700; margin: 0;">Password Reset</h1>
        </div>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi <strong>{name}</strong>,</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">You requested to reset your password. Use the OTP below:</p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #0EA5A4, #14B8A6); color: white; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 16px 32px; border-radius: 12px;">
            {otp}
          </div>
        </div>
        <p style="color: #94A3B8; font-size: 14px; text-align: center;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;">
        <p style="color: #94A3B8; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
    """


def _email_verify_template(name: str, otp: str) -> str:
    return f"""
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #F8FAFC;">
      <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #0EA5A4, #14B8A6); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 28px;">✉️</span>
          </div>
          <h1 style="color: #0F172A; font-size: 24px; font-weight: 700; margin: 0;">Verify Your Email</h1>
        </div>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi <strong>{name}</strong>,</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Welcome to Apex Learning Hub! Use the OTP below to verify your email address:</p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #0EA5A4, #14B8A6); color: white; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 16px 32px; border-radius: 12px;">
            {otp}
          </div>
        </div>
        <p style="color: #94A3B8; font-size: 14px; text-align: center;">This OTP expires in <strong>10 minutes</strong>.</p>
      </div>
    </div>
    """
