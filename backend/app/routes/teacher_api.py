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

@teacher_bp.before_request
@jwt_required()
def require_teacher():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in (UserRole.TEACHER, UserRole.ADMIN):
        return jsonify({"error": "Unauthorized. Only teachers or admins can access these endpoints."}), 403
    request.user = user

# ─── Statistics ─────────────────────────────────────────────────────────────
@teacher_bp.route("/dashboard-stats", methods=["GET"])
def get_stats():
    user = request.user
    user_id = user.id

    # Created tests
    created_tests = Test.query.filter_by(creator_id=user_id).count()

    # Active/Pending reviews (ungraded homework submissions)
    teacher_hw_ids = [h.id for h in Homework.query.filter_by(assigned_by=user_id).all()]
    pending_reviews = HomeworkSubmission.query.filter(
        HomeworkSubmission.homework_id.in_(teacher_hw_ids),
        HomeworkSubmission.status == "submitted"
    ).count() if teacher_hw_ids else 0

    # Total students and classes taught
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

    # Average class score
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
def get_classes():
    # Returns all classes and their student counts
    classes = Class.query.all()
    data = []
    for c in classes:
        student_count = Student.query.filter_by(class_id=c.id).count()
        data.append({"id": c.id, "name": c.name, "student_count": student_count})
    return jsonify({"classes": data}), 200

# ─── Analytics ─────────────────────────────────────────────────────────────
@teacher_bp.route("/analytics", methods=["GET"])
def get_analytics():
    user = request.user
    user_id = user.id

    teacher_test_ids = [t.id for t in Test.query.filter_by(creator_id=user_id).all()]
    if not teacher_test_ids:
        return jsonify({"top_students": [], "weak_students": [], "performance_history": []}), 200

    results = Result.query.filter(
        Result.test_id.in_(teacher_test_ids),
        Result.status == "completed"
    ).all()

    # Aggregate by student
    student_scores = {}
    for r in results:
        if r.student_id not in student_scores:
            student_scores[r.student_id] = []
        student_scores[r.student_id].append(r.percentage)

    student_averages = []
    for sid, scores in student_scores.items():
        s = User.query.get(sid)
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

    # Mock performance history
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
def manage_announcements():
    user = request.user
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

# ─── Pending Reviews ───────────────────────────────────────────────────────
@teacher_bp.route("/reviews/pending", methods=["GET"])
def get_pending_reviews():
    user = request.user
    user_id = user.id

    teacher_hw_ids = [h.id for h in Homework.query.filter_by(assigned_by=user_id).all()]
    pending_homeworks = HomeworkSubmission.query.filter(
        HomeworkSubmission.homework_id.in_(teacher_hw_ids),
        HomeworkSubmission.status == "submitted"
    ).all() if teacher_hw_ids else []

    reviews = []
    for hw in pending_homeworks:
        student = User.query.get(hw.student_id)
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
def grade_review():
    data = request.get_json(silent=True) or {}
    submission_id = data.get("submission_id")
    marks = data.get("marks")
    feedback = data.get("feedback", "")

    if not submission_id or marks is None:
        return jsonify({"error": "submission_id and marks are required"}), 400

    hw_sub = HomeworkSubmission.query.get(submission_id)
    if not hw_sub:
        return jsonify({"error": "Submission not found"}), 404

    hw_sub.marks_obtained = float(marks)
    hw_sub.status = "graded"
    
    # Send notification
    notif = Notification(
        user_id=hw_sub.student_id,
        title="Homework Graded",
        message=f"Your homework '{hw_sub.homework.title}' has been graded: {marks}/{hw_sub.homework.max_marks}."
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Graded successfully"}), 200
