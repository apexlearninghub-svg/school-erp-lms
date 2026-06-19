from flask import request, current_app
from app import db
from app.models import AuditLog, LoginHistory

try:
    from user_agents import parse as parse_ua
    UA_PARSER_AVAILABLE = True
except ImportError:
    UA_PARSER_AVAILABLE = False


def get_client_ip() -> str:
    """Get real client IP (handles proxies)."""
    if request.headers.get("X-Forwarded-For"):
        return request.headers.get("X-Forwarded-For").split(",")[0].strip()
    return request.remote_addr or "unknown"


def parse_user_agent() -> dict:
    """Parse user agent string."""
    ua_string = request.headers.get("User-Agent", "")
    if UA_PARSER_AVAILABLE and ua_string:
        try:
            ua = parse_ua(ua_string)
            return {
                "device": ua.device.family,
                "browser": ua.browser.family,
                "os": ua.os.family,
            }
        except Exception:
            pass
    return {"device": "Unknown", "browser": "Unknown", "os": "Unknown"}


def log_login_history(user_id: str, success: bool, method: str = "password"):
    """Record a login attempt in history."""
    try:
        ua_info = parse_user_agent()
        entry = LoginHistory(
            user_id=user_id,
            ip_address=get_client_ip(),
            device=ua_info.get("device"),
            browser=ua_info.get("browser"),
            os=ua_info.get("os"),
            success=success,
            method=method,
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to log login history: {e}")


def log_audit(user_id: str, action: str, details: dict = None):
    """Create an audit log entry."""
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            details=details or {},
            ip_address=get_client_ip(),
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to create audit log: {e}")
