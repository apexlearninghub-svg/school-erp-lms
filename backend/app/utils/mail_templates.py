import os
from flask_mail import Message
from app import mail
from flask import current_app

def get_otp_html_template(full_name: str, otp_code: str, purpose: str = "email_verification") -> str:
    """Professional Apex Learning Hub themed HTML email template for OTP validation."""
    title = "Verify Your Email Address" if purpose == "email_verification" else "Password Reset Request"
    intro = (
        "Thank you for registering with Apex Learning Hub. To complete your sign-up and activate your account, "
        "please verify your email address using the secure 6-digit One-Time Password (OTP) below:"
        if purpose == "email_verification"
        else "We received a request to reset the password associated with your Apex Learning Hub account. Use the secure 6-digit One-Time Password (OTP) below to proceed:"
    )
    instruction = (
        "Enter this OTP on the verification screen to activate your account."
        if purpose == "email_verification"
        else "Enter this OTP on the password reset screen to set a new password."
    )
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }}
            .wrapper {{
                width: 100%;
                table-layout: fixed;
                background-color: #f8fafc;
                padding: 40px 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
                border: 1px solid #e2e8f0;
            }}
            .header {{
                background: linear-gradient(135deg, #0EA5A4, #14B8A6);
                padding: 40px 20px;
                text-align: center;
            }}
            .header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }}
            .logo {{
                width: 50px;
                height: 50px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 24px;
                font-weight: 900;
                margin-bottom: 15px;
                border: 1px solid rgba(255, 255, 255, 0.4);
            }}
            .content {{
                padding: 40px 30px;
                color: #334155;
                line-height: 1.6;
            }}
            .content h2 {{
                color: #0f172a;
                font-size: 20px;
                margin-top: 0;
                font-weight: 700;
            }}
            .otp-container {{
                background-color: #f1f5f9;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                text-align: center;
                margin: 30px 0;
            }}
            .otp-code {{
                font-family: 'Courier New', Courier, monospace;
                font-size: 38px;
                font-weight: 900;
                color: #0EA5A4;
                letter-spacing: 6px;
                margin: 0;
            }}
            .expiry-note {{
                font-size: 13px;
                color: #64748b;
                margin-top: 10px;
                font-weight: 600;
            }}
            .footer {{
                background-color: #f8fafc;
                padding: 24px 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #94a3b8;
            }}
            .footer p {{
                margin: 5px 0;
            }}
            .notice {{
                font-size: 13px;
                color: #ef4444;
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                padding: 12px;
                border-radius: 8px;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo"><img src="{current_app.config.get('FRONTEND_URL', 'http://localhost:5173')}/logo.png" alt="ALH" style="width:100%;height:100%;object-fit:contain;border-radius:12px;"/></div>
                    <h1>Apex Learning Hub</h1>
                </div>
                <div class="content">
                    <h2>Hello {full_name},</h2>
                    <p>{intro}</p>
                    
                    <div class="otp-container">
                        <div class="otp-code">{otp_code}</div>
                        <div class="expiry-note">This code expires in 5 minutes.</div>
                    </div>
                    
                    <p>{instruction}</p>
                    <p>If you did not initiate this request, please ignore this email or contact the school IT support desk immediately.</p>
                    
                    <div class="notice">
                        <strong>Security Notice:</strong> Never share this OTP code with anyone, including Apex Learning Hub administration or staff.
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; {current_app.config.get('FRONTEND_URL', 'http://localhost:5173').split('//')[-1]} · Apex Learning Hub platform</p>
                    <p>This is an automated system notification. Please do not reply to this email.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def send_otp_email(recipient_email: str, otp_code: str, full_name: str, purpose: str = "email_verification") -> bool:
    """Send generated OTP code to recipient email address."""
    subject = "Verify Your Apex Learning Hub Email" if purpose == "email_verification" else "Reset Your Apex Learning Hub Password"
    html_content = get_otp_html_template(full_name, otp_code, purpose)
    
    sender = current_app.config.get("MAIL_DEFAULT_SENDER", "vishalnishad8585@gmail.com")
    
    # Ensure default sender is set correctly
    if not sender or sender == "noreply@apexhub.edu":
        sender = "vishalnishad8585@gmail.com"
        
    msg = Message(
        subject=subject,
        recipients=[recipient_email],
        html=html_content,
        sender=sender
    )
    
    try:
        mail.send(msg)
        print(f"OTP email sent successfully to {recipient_email}. Code: {otp_code}", flush=True)
        return True
    except Exception as e:
        print(f"FAILED TO SEND EMAIL to {recipient_email}: {e}. DEVELOPMENT FALLBACK - OTP CODE IS: {otp_code}", flush=True)
        # Always return True in development or fallback to server logging so users don't get blocked
        return True
