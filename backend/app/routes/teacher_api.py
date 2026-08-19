import os
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import (
    User, UserRole, Class, Student, Teacher, Test, PublishedTest,
    Result, StudentAnswer, Notification, Attendance, Homework,
    HomeworkSubmission, StudyMaterial, Announcement, Message
)

teacher_bp = Blueprint("teacher", __name__)


def _get_teacher():
    """Helper: returns (user, error_response). Validates JWT and teacher/admin role."""
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user or user.role not in (UserRole.TEACHER, UserRole.ADMIN):
        return None, (jsonify({"error": "Unauthorized. Only teachers or admins can access these endpoints."}), 403)
    return user, None


# ─── Statistics ─────────────────────────────────────────────────────────────
@teacher_bp.route("/dashboard-stats", methods=["GET"])
@jwt_required()
def get_stats():
    user, error = _get_teacher()
    if error:
        return error
    user_id = user.id

    created_tests = Test.query.filter_by(creator_id=user_id).count()

    teacher_hw_ids = [h.id for h in Homework.query.filter_by(assigned_by=user_id).all()]
    pending_reviews = HomeworkSubmission.query.filter(
        HomeworkSubmission.homework_id.in_(teacher_hw_ids),
        HomeworkSubmission.status == "submitted"
    ).count() if teacher_hw_ids else 0

    teacher_test_ids = [t.id for t in Test.query.filter_by(creator_id=user_id).all()]
    published_class_names = [
        c[0] for c in db.session.query(PublishedTest.class_name).filter(
            PublishedTest.test_id.in_(teacher_test_ids)
        ).distinct().all()
    ] if teacher_test_ids else []

    total_students_enrolled = 0
    for class_name in published_class_names:
        cls = Class.query.filter_by(name=class_name).first()
        if cls:
            total_students_enrolled += Student.query.filter_by(class_id=cls.id).count()

    total_evals = Result.query.filter(
        Result.test_id.in_(teacher_test_ids), Result.status == "completed"
    ).all() if teacher_test_ids else []

    avg_score = 0.0
    if total_evals:
        avg_score = sum(r.percentage for r in total_evals) / len(total_evals)

    return jsonify({
        "total_students": total_students_enrolled,
        "active_exams": created_tests,
        "pending_reviews": pending_reviews,
        "average_score": round(avg_score, 1),
        "classes_taught": len(published_class_names)
    }), 200


# ─── Classes & Students ────────────────────────────────────────────────────
@teacher_bp.route("/classes", methods=["GET"])
@jwt_required()
def get_classes():
    _, error = _get_teacher()
    if error:
        return error
    classes = Class.query.all()
    data = []
    for c in classes:
        student_count = Student.query.filter_by(class_id=c.id).count()
        data.append({"id": c.id, "name": c.name, "student_count": student_count})
    return jsonify({"classes": data}), 200


# ─── Students in a class ───────────────────────────────────────────────────
@teacher_bp.route("/students", methods=["GET"])
@jwt_required()
def get_students():
    _, error = _get_teacher()
    if error:
        return error
    class_name = request.args.get("class_name")
    if class_name:
        cls = Class.query.filter_by(name=class_name).first()
        if not cls:
            return jsonify({"students": []}), 200
        students = Student.query.filter_by(class_id=cls.id).all()
    else:
        students = Student.query.all()

    result = []
    for s in students:
        user = db.session.get(User, s.user_id)
        if user:
            result.append({
                "id": user.id,
                "full_name": user.full_name,
                "roll_number": s.roll_number,
                "class_name": s.student_class.name if s.student_class else "N/A",
            })
    return jsonify({"students": result}), 200


# ─── Analytics ─────────────────────────────────────────────────────────────
@teacher_bp.route("/analytics", methods=["GET"])
@jwt_required()
def get_analytics():
    user, error = _get_teacher()
    if error:
        return error
    user_id = user.id

    teacher_test_ids = [t.id for t in Test.query.filter_by(creator_id=user_id).all()]
    if not teacher_test_ids:
        return jsonify({"top_students": [], "weak_students": [], "performance_history": []}), 200

    results = Result.query.filter(
        Result.test_id.in_(teacher_test_ids),
        Result.status == "completed"
    ).all()

    student_scores = {}
    for r in results:
        if r.student_id not in student_scores:
            student_scores[r.student_id] = []
        student_scores[r.student_id].append(r.percentage)

    student_averages = []
    for sid, scores in student_scores.items():
        s = db.session.get(User, sid)
        if s:
            student_averages.append({
                "id": s.id,
                "name": s.full_name,
                "roll_number": s.student_profile.roll_number if s.student_profile else "N/A",
                "average": sum(scores) / len(scores),
                "tests_taken": len(scores)
            })

    student_averages.sort(key=lambda x: x["average"], reverse=True)
    top_students = student_averages[:5]
    weak_students = student_averages[-5:] if len(student_averages) > 5 else []

    performance_history = [
        {"name": "Jan", "score": 65},
        {"name": "Feb", "score": 68},
        {"name": "Mar", "score": 75},
        {"name": "Apr", "score": 72},
        {"name": "May", "score": 80},
    ]

    return jsonify({
        "top_students": top_students,
        "weak_students": weak_students,
        "performance_history": performance_history
    }), 200


# ─── Announcements ────────────────────────────────────────────────────────
@teacher_bp.route("/announcements", methods=["GET", "POST"])
@jwt_required()
def manage_announcements():
    user, error = _get_teacher()
    if error:
        return error
    user_id = user.id

    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        title = data.get("title")
        content = data.get("content")
        target = data.get("target_audience", "all")
        class_name = data.get("class_name")

        if not title or not content:
            return jsonify({"error": "Title and content required"}), 400

        ann = Announcement(
            title=title,
            content=content,
            target_audience=target,
            class_name=class_name,
            created_by=user_id
        )
        db.session.add(ann)
        db.session.commit()
        return jsonify({"message": "Announcement created", "announcement": ann.to_dict()}), 201

    announcements = Announcement.query.filter_by(created_by=user_id).order_by(Announcement.created_at.desc()).all()
    return jsonify({"announcements": [a.to_dict() for a in announcements]}), 200


# ─── Mark Attendance ───────────────────────────────────────────────────────
@teacher_bp.route("/attendance/mark", methods=["POST"])
@jwt_required()
def mark_attendance():
    user, error = _get_teacher()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    records = data.get("records", [])  # [{student_id, date, status, subject}]
    date = data.get("date")
    subject = data.get("subject", "")

    if not records and not date:
        return jsonify({"error": "records or date is required"}), 400

    marked = 0
    for rec in records:
        student_id = rec.get("student_id")
        rec_date = rec.get("date", date)
        status = rec.get("status", "present")
        rec_subject = rec.get("subject", subject)

        if not student_id or not rec_date:
            continue

        existing = Attendance.query.filter_by(
            student_id=student_id, date=rec_date, subject=rec_subject
        ).first()

        if existing:
            existing.status = status
            existing.marked_by = user.id
        else:
            att = Attendance(
                student_id=student_id,
                date=rec_date,
                status=status,
                subject=rec_subject,
                marked_by=user.id
            )
            db.session.add(att)
        marked += 1

    db.session.commit()
    return jsonify({"message": f"Attendance marked for {marked} students."}), 200


# ─── Pending Reviews ───────────────────────────────────────────────────────
@teacher_bp.route("/reviews/pending", methods=["GET"])
@jwt_required()
def get_pending_reviews():
    user, error = _get_teacher()
    if error:
        return error
    user_id = user.id

    teacher_hw_ids = [h.id for h in Homework.query.filter_by(assigned_by=user_id).all()]
    pending_homeworks = HomeworkSubmission.query.filter(
        HomeworkSubmission.homework_id.in_(teacher_hw_ids),
        HomeworkSubmission.status == "submitted"
    ).all() if teacher_hw_ids else []

    reviews = []
    for hw in pending_homeworks:
        student = db.session.get(User, hw.student_id)
        reviews.append({
            "id": hw.id,
            "type": "Homework",
            "title": hw.homework.title,
            "student_name": student.full_name if student else "Unknown",
            "submitted_at": hw.submitted_at.isoformat() if hw.submitted_at else None,
            "notes": hw.notes,
            "max_marks": hw.homework.max_marks
        })

    return jsonify({"pending_reviews": reviews}), 200


@teacher_bp.route("/reviews/grade", methods=["POST"])
@jwt_required()
def grade_review():
    _, error = _get_teacher()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    submission_id = data.get("submission_id")
    marks = data.get("marks")
    feedback = data.get("feedback", "")

    if not submission_id or marks is None:
        return jsonify({"error": "submission_id and marks are required"}), 400

    hw_sub = db.session.get(HomeworkSubmission, submission_id)
    if not hw_sub:
        return jsonify({"error": "Submission not found"}), 404

    hw_sub.marks_obtained = float(marks)
    hw_sub.feedback = feedback
    hw_sub.status = "graded"

    notif = Notification(
        user_id=hw_sub.student_id,
        title="Homework Graded",
        message=f"Your homework '{hw_sub.homework.title}' has been graded: {marks}/{hw_sub.homework.max_marks}."
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Graded successfully"}), 200
