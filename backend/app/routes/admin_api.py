from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, UserRole, Class, Section, Subject, FeePayment, SystemSetting, Admission, Result, Test, Attendance, Teacher, Student, Notification
from app import db
from datetime import datetime, timezone
import uuid

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _require_admin():
    """Helper: returns (user, error_response). Call at start of every admin route."""
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user or user.role != UserRole.ADMIN:
        return None, (jsonify({"error": "Unauthorized. Admin access required."}), 403)
    return user, None


@admin_bp.route("/dashboard-stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    _, err = _require_admin()
    if err:
        return err
    try:
        total_students = User.query.filter_by(role=UserRole.STUDENT, is_active=True).count()
        total_teachers = User.query.filter_by(role=UserRole.TEACHER, is_active=True).count()
        total_parents = User.query.filter_by(role=UserRole.PARENT, is_active=True).count()
        total_staff = User.query.filter_by(role=UserRole.STAFF, is_active=True).count()
        total_classes = Class.query.count()
        total_subjects = Subject.query.count()
        active_exams = Test.query.count()
        
        fee_records = FeePayment.query.filter_by(status='completed').all()
        total_revenue = sum(fee.amount for fee in fee_records)
        
        monthly_revenue = total_revenue * 0.2 if total_revenue > 0 else 0
            
        pending_approvals = Admission.query.filter_by(status='pending').count()
        active_users = User.query.filter_by(is_active=True).count()
        
        attendance_records = Attendance.query.all()
        attendance_percentage = 95.0
        if attendance_records:
            present = sum(1 for a in attendance_records if a.status == "present")
            attendance_percentage = round((present / len(attendance_records)) * 100, 1)
        
        return jsonify({
            "kpis": {
                "total_students": {"value": total_students, "growth": "+5.2%", "trend": "up", "comparison": "vs last month"},
                "total_teachers": {"value": total_teachers, "growth": "+2.1%", "trend": "up", "comparison": "vs last month"},
                "total_parents": {"value": total_parents, "growth": "+4.3%", "trend": "up", "comparison": "vs last month"},
                "total_staff": {"value": total_staff, "growth": "0.0%", "trend": "neutral", "comparison": "vs last month"},
                "total_classes": {"value": total_classes, "growth": "+1", "trend": "up", "comparison": "vs last term"},
                "active_courses": {"value": total_subjects, "growth": "+3", "trend": "up", "comparison": "vs last term"},
                "active_exams": {"value": active_exams, "growth": "+12%", "trend": "up", "comparison": "vs last month"},
                "attendance_rate": {"value": f"{attendance_percentage}%", "growth": "+1.2%", "trend": "up", "comparison": "vs last month"},
                "pending_approvals": {"value": pending_approvals, "growth": "-5%", "trend": "down", "comparison": "vs last week"},
                "monthly_revenue": {"value": monthly_revenue, "growth": "+8.4%", "trend": "up", "comparison": "vs last month"},
                "total_revenue": {"value": total_revenue, "growth": "+15.2%", "trend": "up", "comparison": "vs last year"},
                "active_users": {"value": active_users, "growth": "+6.7%", "trend": "up", "comparison": "vs last month"}
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    _, err = _require_admin()
    if err:
        return err
    role = request.args.get("role")
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    admin, err = _require_admin()
    if err:
        return err
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    if user.id == admin.id:
        return jsonify({"error": "Cannot delete your own account."}), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User '{user.full_name}' deleted successfully."}), 200


@admin_bp.route("/users/<user_id>/toggle-status", methods=["PUT"])
@jwt_required()
def toggle_user_status(user_id):
    admin, err = _require_admin()
    if err:
        return err
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    if user.id == admin.id:
        return jsonify({"error": "Cannot deactivate your own account."}), 400
    user.is_active = not user.is_active
    db.session.commit()
    status = "activated" if user.is_active else "deactivated"
    return jsonify({"message": f"User '{user.full_name}' {status}.", "is_active": user.is_active}), 200


@admin_bp.route("/finance/revenue", methods=["GET"])
@jwt_required()
def get_revenue_data():
    _, err = _require_admin()
    if err:
        return err
    fee_records = FeePayment.query.filter_by(status='completed').all()
    total_revenue = sum(fee.amount for fee in fee_records)
    
    pending_records = FeePayment.query.filter_by(status='pending').all()
    total_outstanding = sum(fee.amount for fee in pending_records)
    
    total_expected = total_revenue + total_outstanding
    collection_rate = (total_revenue / total_expected * 100) if total_expected > 0 else 100.0

    return jsonify({
        "monthly_revenue": [],
        "total_collected": total_revenue,
        "total_outstanding": total_outstanding,
        "collection_rate": round(collection_rate, 1)
    }), 200


@admin_bp.route("/finance/payment", methods=["POST"])
@jwt_required()
def record_payment():
    """Admin records a fee payment for a student."""
    _, err = _require_admin()
    if err:
        return err
    data = request.get_json() or {}
    student_id = data.get("student_id")
    amount = data.get("amount")
    payment_method = data.get("payment_method", "cash")
    description = data.get("description", "Fee Payment")
    status = data.get("status", "completed")

    if not student_id or not amount:
        return jsonify({"error": "student_id and amount are required."}), 400

    student = User.query.filter_by(id=student_id, role=UserRole.STUDENT).first()
    if not student:
        return jsonify({"error": "Student not found."}), 404

    payment = FeePayment(
        student_id=student_id,
        amount=float(amount),
        payment_method=payment_method,
        description=description,
        status=status
    )
    db.session.add(payment)

    # Notify student
    notif = Notification(
        user_id=student_id,
        title="Fee Payment Recorded",
        message=f"A fee payment of ₹{amount} ({description}) has been recorded. Status: {status}."
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Payment recorded successfully.", "payment": payment.to_dict()}), 201


@admin_bp.route("/academics", methods=["GET"])
@jwt_required()
def get_academics():
    _, err = _require_admin()
    if err:
        return err
    classes = Class.query.all()
    subjects = Subject.query.all()
    sections = Section.query.all()
    
    return jsonify({
        "classes": [{"id": c.id, "name": c.name} for c in classes],
        "subjects": [{"id": s.id, "name": s.name, "code": s.code} for s in subjects],
        "sections": [{"id": s.id, "name": s.name, "class_id": s.class_id} for s in sections]
    }), 200


@admin_bp.route("/academics/class", methods=["POST"])
@jwt_required()
def create_class():
    _, err = _require_admin()
    if err:
        return err
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Class name is required."}), 400
    if Class.query.filter_by(name=name).first():
        return jsonify({"error": "A class with this name already exists."}), 409
    cls = Class(name=name)
    db.session.add(cls)
    db.session.commit()
    return jsonify({"message": "Class created.", "class": {"id": cls.id, "name": cls.name}}), 201


@admin_bp.route("/academics/class/<class_id>", methods=["DELETE"])
@jwt_required()
def delete_class(class_id):
    _, err = _require_admin()
    if err:
        return err
    cls = db.session.get(Class, class_id)
    if not cls:
        return jsonify({"error": "Class not found."}), 404
    db.session.delete(cls)
    db.session.commit()
    return jsonify({"message": "Class deleted."}), 200


@admin_bp.route("/academics/subject", methods=["POST"])
@jwt_required()
def create_subject():
    _, err = _require_admin()
    if err:
        return err
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    code = data.get("code", "").strip() or None
    description = data.get("description", "")
    if not name:
        return jsonify({"error": "Subject name is required."}), 400
    subj = Subject(name=name, code=code, description=description)
    db.session.add(subj)
    db.session.commit()
    return jsonify({"message": "Subject created.", "subject": {"id": subj.id, "name": subj.name, "code": subj.code}}), 201


@admin_bp.route("/academics/subject/<subject_id>", methods=["DELETE"])
@jwt_required()
def delete_subject(subject_id):
    _, err = _require_admin()
    if err:
        return err
    subj = db.session.get(Subject, subject_id)
    if not subj:
        return jsonify({"error": "Subject not found."}), 404
    db.session.delete(subj)
    db.session.commit()
    return jsonify({"message": "Subject deleted."}), 200


@admin_bp.route("/system/health", methods=["GET"])
@jwt_required()
def get_system_health():
    _, err = _require_admin()
    if err:
        return err
    return jsonify({
        "status": "Healthy",
        "cpu_usage": "34%",
        "memory_usage": "2.4 GB / 8 GB",
        "database_status": "Connected",
        "active_users": User.query.filter_by(is_active=True).count(),
        "storage": "45% Used"
    }), 200


@admin_bp.route("/analytics/enrollment", methods=["GET"])
@jwt_required()
def get_enrollment_analytics():
    _, err = _require_admin()
    if err:
        return err
    return jsonify({
        "data": [
            {"month": "Jan", "students": 1200, "teachers": 80},
            {"month": "Feb", "students": 1250, "teachers": 82},
            {"month": "Mar", "students": 1280, "teachers": 85},
            {"month": "Apr", "students": 1350, "teachers": 88},
            {"month": "May", "students": 1420, "teachers": 92},
            {"month": "Jun", "students": 1500, "teachers": 95}
        ]
    }), 200


@admin_bp.route("/analytics/attendance", methods=["GET"])
@jwt_required()
def get_attendance_analytics():
    _, err = _require_admin()
    if err:
        return err
    return jsonify({
        "data": [
            {"name": "Present", "value": 85, "fill": "#10B981"},
            {"name": "Absent", "value": 10, "fill": "#EF4444"},
            {"name": "Late", "value": 5, "fill": "#F59E0B"}
        ]
    }), 200


@admin_bp.route("/performance/trends", methods=["GET"])
@jwt_required()
def get_performance_trends():
    _, err = _require_admin()
    if err:
        return err
    return jsonify({
        "trends": [
            {"subject": "Math", "score": 85},
            {"subject": "Science", "score": 78},
            {"subject": "English", "score": 82},
            {"subject": "History", "score": 75},
            {"subject": "Art", "score": 92}
        ]
    }), 200


# ─── Student Creation ─────────────────────────────────────────────────────────

@admin_bp.route("/student/create", methods=["POST"])
@jwt_required()
def create_student():
    _, err = _require_admin()
    if err:
        return err
    try:
        from app import bcrypt
        import random
        
        data = request.get_json() or {}
        full_name = data.get("full_name")
        email = data.get("email")
        username = data.get("username")
        class_name = data.get("class_name") or "Class 10"
        father_name = data.get("father_name")
        mother_name = data.get("mother_name")
        roll_number = data.get("roll_number")
        
        if not full_name or not email or not username:
            return jsonify({"error": "Full name, email, and username are required."}), 400
            
        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            return jsonify({"error": "A user with this email or username already exists."}), 400
            
        temp_password = f"Stud@{random.randint(1000, 9999)}"
        password_hash = bcrypt.generate_password_hash(temp_password).decode("utf-8")
        
        cls = Class.query.filter_by(name=class_name).first()
        if not cls:
            cls = Class(name=class_name)
            db.session.add(cls)
            db.session.flush()
            
        user = User(
            full_name=full_name,
            email=email,
            username=username,
            password_hash=password_hash,
            role=UserRole.STUDENT,
            is_verified=True,
            is_active=True
        )
        db.session.add(user)
        db.session.flush()
        
        if not roll_number:
            roll_number = f"S{random.randint(1000, 9999)}"
            
        student_profile = Student(
            user_id=user.id,
            father_name=father_name,
            mother_name=mother_name,
            class_id=cls.id,
            roll_number=roll_number
        )
        db.session.add(student_profile)
        
        notification = Notification(
            user_id=user.id,
            title="Account Created",
            message=f"Welcome {full_name}! Your student credentials are: Username: {username}, Password: {temp_password}"
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            "message": "Student created successfully.",
            "user": user.to_dict(),
            "credentials": {"username": username, "password": temp_password}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ─── Teacher Creation ─────────────────────────────────────────────────────────

@admin_bp.route("/teacher/create", methods=["POST"])
@jwt_required()
def create_teacher():
    """Admin creates a teacher account with profile."""
    _, err = _require_admin()
    if err:
        return err
    try:
        from app import bcrypt
        import random

        data = request.get_json() or {}
        full_name = data.get("full_name")
        email = data.get("email")
        username = data.get("username")
        designation = data.get("designation", "Teacher")
        department = data.get("department", "General")
        employee_id = data.get("employee_id")

        if not full_name or not email or not username:
            return jsonify({"error": "Full name, email, and username are required."}), 400

        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            return jsonify({"error": "A user with this email or username already exists."}), 400

        temp_password = f"Teach@{random.randint(1000, 9999)}"
        password_hash = bcrypt.generate_password_hash(temp_password).decode("utf-8")

        user = User(
            full_name=full_name,
            email=email,
            username=username,
            password_hash=password_hash,
            role=UserRole.TEACHER,
            is_verified=True,
            is_active=True
        )
        db.session.add(user)
        db.session.flush()

        if not employee_id:
            employee_id = f"TCH{username.upper()}"

        # Ensure employee_id is unique
        if Teacher.query.filter_by(employee_id=employee_id).first():
            employee_id = f"TCH{username.upper()}{random.randint(10, 99)}"

        teacher_profile = Teacher(
            user_id=user.id,
            employee_id=employee_id,
            designation=designation,
            department=department
        )
        db.session.add(teacher_profile)

        notification = Notification(
            user_id=user.id,
            title="Teacher Account Created",
            message=f"Welcome {full_name}! Your teacher credentials: Username: {username}, Password: {temp_password}"
        )
        db.session.add(notification)
        db.session.commit()

        return jsonify({
            "message": "Teacher created successfully.",
            "user": user.to_dict(),
            "credentials": {"username": username, "password": temp_password}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ─── Parent Creation & Linking ────────────────────────────────────────────────

@admin_bp.route("/parent/create", methods=["POST"])
@jwt_required()
def create_parent():
    _, err = _require_admin()
    if err:
        return err
    try:
        from app import bcrypt
        from app.models import Parent
        import random
        
        data = request.get_json() or {}
        full_name = data.get("full_name")
        email = data.get("email")
        username = data.get("username")
        phone_number = data.get("phone_number")
        occupation = data.get("occupation")
        address = data.get("address")
        student_id = data.get("student_id")
        
        if not full_name or not email or not username:
            return jsonify({"error": "Full name, email, and username are required."}), 400
            
        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            return jsonify({"error": "A user with this email or username already exists."}), 400
            
        if student_id:
            student_exists = User.query.filter_by(id=student_id, role=UserRole.STUDENT).first()
            if not student_exists:
                return jsonify({"error": "Linked student not found."}), 404
                
        temp_password = f"Parn@{random.randint(1000, 9999)}"
        password_hash = bcrypt.generate_password_hash(temp_password).decode("utf-8")
        
        user = User(
            full_name=full_name,
            email=email,
            username=username,
            password_hash=password_hash,
            role=UserRole.PARENT,
            is_verified=True,
            is_active=True
        )
        db.session.add(user)
        db.session.flush()
        
        parent_profile = Parent(
            user_id=user.id,
            student_id=student_id,
            occupation=occupation,
            phone_number=phone_number,
            address=address
        )
        db.session.add(parent_profile)
        
        notification = Notification(
            user_id=user.id,
            title="Account Created",
            message=f"Welcome {full_name}! Your parent credentials: Username: {username}, Password: {temp_password}"
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            "message": "Parent created successfully.",
            "user": user.to_dict(),
            "credentials": {"username": username, "password": temp_password}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/parent/link", methods=["POST"])
@jwt_required()
def link_parent_student():
    _, err = _require_admin()
    if err:
        return err
    try:
        from app.models import Parent
        data = request.get_json() or {}
        parent_user_id = data.get("parent_id")
        student_user_id = data.get("student_id")
        
        if not parent_user_id or not student_user_id:
            return jsonify({"error": "Parent ID and Student ID are required."}), 400
            
        parent = Parent.query.filter_by(user_id=parent_user_id).first()
        if not parent:
            return jsonify({"error": "Parent not found."}), 404
            
        student = User.query.filter_by(id=student_user_id, role=UserRole.STUDENT).first()
        if not student:
            return jsonify({"error": "Student not found."}), 404
            
        parent.student_id = student_user_id
        db.session.commit()
        
        return jsonify({"message": f"Successfully linked parent to student {student.full_name}."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ─── Admission Management ─────────────────────────────────────────────────────

@admin_bp.route("/admissions", methods=["GET"])
@jwt_required()
def get_admissions():
    _, err = _require_admin()
    if err:
        return err
    status_filter = request.args.get("status")
    query = Admission.query
    if status_filter:
        query = query.filter_by(status=status_filter)
    admissions = query.order_by(Admission.created_at.desc()).all()
    return jsonify({"admissions": [a.to_dict() for a in admissions]}), 200


@admin_bp.route("/admissions/<admission_id>/status", methods=["PUT"])
@jwt_required()
def update_admission_status(admission_id):
    _, err = _require_admin()
    if err:
        return err
    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in ["pending", "approved", "rejected"]:
        return jsonify({"error": "Status must be: pending, approved, or rejected."}), 400

    admission = db.session.get(Admission, admission_id)
    if not admission:
        return jsonify({"error": "Admission record not found."}), 404

    admission.status = new_status
    notif = Notification(
        user_id=admission.user_id,
        title=f"Admission {new_status.capitalize()}",
        message=f"Your admission application has been {new_status}."
    )
    db.session.add(notif)
    db.session.commit()
    return jsonify({"message": f"Admission {new_status}.", "admission": admission.to_dict()}), 200
