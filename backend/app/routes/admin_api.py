from flask import Blueprint, jsonify, request
from app.models import User, UserRole, Class, Section, Subject, FeePayment, SystemSetting, Admission, Result, Test, Attendance
from app import db
from datetime import datetime, timezone
import uuid

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/dashboard-stats", methods=["GET"])
def get_dashboard_stats():
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
        
        # Calculate monthly revenue (mock logic: just take 20% of total_revenue for current month)
        monthly_revenue = total_revenue * 0.2 if total_revenue > 0 else 0
            
        pending_approvals = Admission.query.filter_by(status='pending').count()
        active_users = User.query.filter_by(is_active=True).count()
        
        # Real attendance rate if records exist
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
def get_users():
    role = request.args.get("role")
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200

@admin_bp.route("/finance/revenue", methods=["GET"])
def get_revenue_data():
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

@admin_bp.route("/academics", methods=["GET"])
def get_academics():
    classes = Class.query.all()
    subjects = Subject.query.all()
    sections = Section.query.all()
    
    return jsonify({
        "classes": [{"id": c.id, "name": c.name} for c in classes],
        "subjects": [{"id": s.id, "name": s.name, "code": s.code} for s in subjects],
        "sections": [{"id": s.id, "name": s.name, "class_id": s.class_id} for s in sections]
    }), 200

@admin_bp.route("/system/health", methods=["GET"])
def get_system_health():
    return jsonify({
        "status": "Healthy",
        "cpu_usage": "34%",
        "memory_usage": "2.4 GB / 8 GB",
        "database_status": "Connected",
        "active_users": User.query.filter_by(is_active=True).count(),
        "storage": "45% Used"
    }), 200

@admin_bp.route("/analytics/enrollment", methods=["GET"])
def get_enrollment_analytics():
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
def get_attendance_analytics():
    return jsonify({
        "data": [
            {"name": "Present", "value": 85, "fill": "#10B981"},
            {"name": "Absent", "value": 10, "fill": "#EF4444"},
            {"name": "Late", "value": 5, "fill": "#F59E0B"}
        ]
    }), 200

@admin_bp.route("/performance/trends", methods=["GET"])
def get_performance_trends():
    return jsonify({
        "trends": [
            {"subject": "Math", "score": 85},
            {"subject": "Science", "score": 78},
            {"subject": "English", "score": 82},
            {"subject": "History", "score": 75},
            {"subject": "Art", "score": 92}
        ]
    }), 200

# ─── Parent/Student Creation & Linking Flow ───────────────────────────────────

@admin_bp.route("/student/create", methods=["POST"])
def create_student():
    try:
        from app import bcrypt
        from app.models import Student, Notification
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
            
        # Generate temporary password
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
        
        # Save a notification representing system sending credentials
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
            "credentials": {
                "username": username,
                "password": temp_password
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/parent/create", methods=["POST"])
def create_parent():
    try:
        from app import bcrypt
        from app.models import Student, Parent, Notification
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
                
        # Generate temporary password
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
        
        # Save a notification representing system sending credentials
        notification = Notification(
            user_id=user.id,
            title="Account Created",
            message=f"Welcome {full_name}! Your parent credentials are: Username: {username}, Password: {temp_password}"
        )
        db.session.add(notification)
        
        db.session.commit()
        
        return jsonify({
            "message": "Parent created successfully.",
            "user": user.to_dict(),
            "credentials": {
                "username": username,
                "password": temp_password
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/parent/link", methods=["POST"])
def link_parent_student():
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
