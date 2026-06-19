import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import config

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()
limiter = Limiter(key_func=get_remote_address)


def create_app(config_name: str = None):
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    # CORS
    CORS(app, 
         origins=app.config["CORS_ORIGINS"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-CSRF-TOKEN"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        from flask import jsonify
        return jsonify({"error": "Token has expired", "code": "TOKEN_EXPIRED"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        from flask import jsonify
        return jsonify({"error": "Invalid token", "code": "INVALID_TOKEN"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        from flask import jsonify
        return jsonify({"error": "Authorization required", "code": "UNAUTHORIZED"}), 401

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.api import api_bp
    from app.routes.teacher_api import teacher_bp
    from app.routes.admin_api import admin_bp
    from app.routes.parent_api import parent_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(teacher_bp, url_prefix="/api/teacher")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(parent_bp, url_prefix="/api/parent")

    # Root → redirect to frontend
    @app.route("/")
    def index():
        from flask import redirect
        return redirect(app.config.get("FRONTEND_URL", "http://localhost:5173"))

    # Health check
    @app.route("/api/health")
    def health():
        from flask import jsonify
        return jsonify({"status": "ok", "version": "1.0.0"})

    return app
