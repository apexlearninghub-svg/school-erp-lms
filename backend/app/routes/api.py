import os
import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models import (
    User, UserRole, Admission, Student, Teacher, Class,
    Test, Question, PublishedTest, StudentAnswer, Result, Notification,
    Attendance, Homework, HomeworkSubmission, StudyMaterial
)
from app.utils.validators import sanitize_string, is_valid_email, is_valid_username
from app.services.gemini_service import generate_mcq_test

api_bp = Blueprint("api", __name__)

# Helper to decode and save base64 documents
def save_base64_doc(base64_str, folder, prefix):
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
        current_app.logger.error(f"Failed to save base64 document: {e}")
        return None


# ─── Authentication Endpoints ───────────────────────────────────────────────

@api_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    full_name = sanitize_string(data.get("full_name", ""), 255)
    email = sanitize_string(data.get("email", ""), 255).lower()
    username = sanitize_string(data.get("username", ""), 100).lower()
    password = data.get("password", "")
    role = sanitize_string(data.get("role", UserRole.STUDENT), 50).lower()

    if not full_name or not email or not username or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email address"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username is already taken"}), 409

    # Create User
    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(
        full_name=full_name,
        email=email,
        username=username,
        password_hash=password_hash,
        role=role,
        is_verified=True,
        is_active=True
    )
    db.session.add(user)
    db.session.commit()

    # Automatically create Student/Teacher Profiles
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

    return jsonify({
        "message": "User registered successfully",
        "user": user.to_dict()
    }), 201


@api_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    identifier = sanitize_string(data.get("identifier", data.get("username", "")), 255)
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "Username/email and password are required"}), 400

    if is_valid_email(identifier):
        user = User.query.filter_by(email=identifier.lower()).first()
    else:
        user = User.query.filter_by(username=identifier.lower()).first()

    if not user or not user.password_hash or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"error": "Your account is deactivated"}), 403

    from flask_jwt_extended import create_access_token, create_refresh_token
    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    refresh_token = create_refresh_token(identity=user.id)

    # Return
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
        "redirect_url": user.get_dashboard_url()
    }), 200


@api_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user_data = user.to_dict()
    # Add profile information
    if user.role == UserRole.STUDENT and user.student_profile:
        user_data["student_profile"] = {
            "father_name": user.student_profile.father_name,
            "mother_name": user.student_profile.mother_name,
            "class_name": user.student_profile.student_class.name if user.student_profile.student_class else "Class 10",
            "roll_number": user.student_profile.roll_number
        }
    elif user.role == UserRole.TEACHER and user.teacher_profile:
        user_data["teacher_profile"] = {
            "employee_id": user.teacher_profile.employee_id,
            "designation": user.teacher_profile.designation,
            "department": user.teacher_profile.department
        }
    return jsonify({"user": user_data}), 200


# ─── Admission Endpoints ────────────────────────────────────────────────────

@api_bp.route("/admissions", methods=["POST"])
@jwt_required()
def submit_admission():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Allow one submission per user
    if user.admission:
        return jsonify({"error": "Admission application already submitted"}), 400

    data = request.get_json(silent=True) or {}
    student_name = sanitize_string(data.get("student_name", ""), 255)
    father_name = sanitize_string(data.get("father_name", ""), 255)
    mother_name = sanitize_string(data.get("mother_name", ""), 255)
    email = sanitize_string(data.get("email", ""), 255).lower()
    phone = sanitize_string(data.get("phone", ""), 50)
    dob = sanitize_string(data.get("dob", ""), 50)
    gender = sanitize_string(data.get("gender", ""), 20)
    class_applied = sanitize_string(data.get("class_applied", ""), 100)
    address = sanitize_string(data.get("address", ""), 2000)

    if not student_name or not email or not phone or not dob or not gender or not address:
        return jsonify({"error": "Missing required personal details"}), 422

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    photo_url = save_base64_doc(data.get("photo"), upload_folder, f"photo_{user_id}")
    aadhaar_url = save_base64_doc(data.get("aadhaar_card"), upload_folder, f"aadhaar_{user_id}")

    admission = Admission(
        user_id=user_id,
        student_name=student_name,
        father_name=father_name,
        mother_name=mother_name,
        email=email,
        phone=phone,
        dob=dob,
        gender=gender,
        class_applied=class_applied,
        address=address,
        photo=photo_url,
        aadhaar_card=aadhaar_url,
        status="pending"
    )

    db.session.add(admission)
    db.session.commit()

    return jsonify({
        "message": "Admission application submitted successfully",
        "admission": admission.to_dict()
    }), 201


@api_bp.route("/admissions", methods=["GET"])
@jwt_required()
def get_admissions():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != UserRole.ADMIN:
        # Return only current user's admission if student
        admissions = Admission.query.filter_by(user_id=user_id).all()
    else:
        admissions = Admission.query.all()
    
    return jsonify({"admissions": [adm.to_dict() for adm in admissions]}), 200


@api_bp.route("/admissions/<admission_id>/status", methods=["PUT"])
@jwt_required()
def update_admission_status(admission_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != UserRole.ADMIN:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    if new_status not in ["pending", "approved", "rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    admission = Admission.query.get(admission_id)
    if not admission:
        return jsonify({"error": "Admission record not found"}), 404

    admission.status = new_status
    db.session.commit()

    # Create notification for student
    noti = Notification(
        user_id=admission.user_id,
        title=f"Admission Application {new_status.capitalize()}",
        message=f"Your admission application for {admission.class_applied} has been {new_status}."
    )
    db.session.add(noti)
    db.session.commit()

    return jsonify({
        "message": "Admission status updated successfully",
        "admission": admission.to_dict()
    }), 200


# ─── AI Test Generator & Exams ──────────────────────────────────────────────

@api_bp.route("/generate-test", methods=["POST"])
@jwt_required()
def generate_test():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != UserRole.TEACHER:
        return jsonify({"error": "Unauthorized. Only teachers can generate tests."}), 403

    data = request.get_json(silent=True) or {}
    title = sanitize_string(data.get("title", ""), 255)
    subject = sanitize_string(data.get("subject", ""), 255)
    difficulty = sanitize_string(data.get("difficulty", "medium"), 50)
    count = int(data.get("count", 10))
    prompt = data.get("prompt", "")

    if not title or not subject:
        return jsonify({"error": "Title and Subject are required"}), 400

    # Trigger Gemini MCQ Generation
    try:
        mcq_questions = generate_mcq_test(subject, prompt, difficulty, count)
    except RuntimeError as e:
        return jsonify({
            "error": "AI generation failed",
            "detail": str(e),
            "fix": "Your Gemini API key has exceeded its quota. Get a new free key at https://aistudio.google.com/app/apikey"
        }), 503

    # Save Test Draft to Database
    test = Test(
        title=title,
        subject=subject,
        difficulty=difficulty,
        total_questions=len(mcq_questions),
        creator_id=user_id,
        duration=int(data.get("duration", 30)),
        correct_marks=float(data.get("correct_marks", 1.0)),
        negative_marks=float(data.get("negative_marks", 0.0)),
        passing_marks=float(data.get("passing_marks", 4.0)),
        is_timed=bool(data.get("is_timed", True))
    )
    db.session.add(test)
    db.session.flush()

    for idx, q in enumerate(mcq_questions):
        question = Question(
            test_id=test.id,
            question_text=q.get("question_text", f"Generated question {idx+1}?"),
            option_a=q.get("option_a", "Option A"),
            option_b=q.get("option_b", "Option B"),
            option_c=q.get("option_c", "Option C"),
            option_d=q.get("option_d", "Option D"),
            correct_option=q.get("correct_option", "A").upper(),
            explanation=q.get("explanation", "")
        )
        db.session.add(question)
    
    db.session.commit()

    return jsonify({
        "message": "AI Test generated successfully",
        "test": test.to_dict(include_questions=True)
    }), 201


@api_bp.route("/tests/<test_id>", methods=["PUT"])
@jwt_required()
def edit_test(test_id):
    user_id = get_jwt_identity()
    test = Test.query.filter_by(id=test_id, creator_id=user_id).first()
    if not test:
        return jsonify({"error": "Test not found or unauthorized"}), 404

    data = request.get_json(silent=True) or {}
    test.title = sanitize_string(data.get("title", test.title), 255)
    test.subject = sanitize_string(data.get("subject", test.subject), 255)
    test.duration = int(data.get("duration", test.duration))
    test.correct_marks = float(data.get("correct_marks", test.correct_marks))
    test.negative_marks = float(data.get("negative_marks", test.negative_marks))
    test.passing_marks = float(data.get("passing_marks", test.passing_marks))
    test.is_timed = bool(data.get("is_timed", test.is_timed))

    # Overwrite Questions if provided
    if "questions" in data:
        # Delete old questions
        Question.query.filter_by(test_id=test_id).delete()
        for q in data["questions"]:
            question = Question(
                test_id=test.id,
                question_text=q.get("question_text"),
                option_a=q.get("option_a"),
                option_b=q.get("option_b"),
                option_c=q.get("option_c"),
                option_d=q.get("option_d"),
                correct_option=q.get("correct_option", "A").upper(),
                explanation=q.get("explanation")
            )
            db.session.add(question)
        test.total_questions = len(data["questions"])

    db.session.commit()
    return jsonify({"message": "Test updated successfully", "test": test.to_dict(include_questions=True)}), 200


@api_bp.route("/tests/<test_id>", methods=["DELETE"])
@jwt_required()
def delete_test(test_id):
    user_id = get_jwt_identity()
    test = Test.query.filter_by(id=test_id, creator_id=user_id).first()
    if not test:
        return jsonify({"error": "Test not found or unauthorized"}), 404

    db.session.delete(test)
    db.session.commit()
    return jsonify({"message": "Test deleted successfully"}), 200


@api_bp.route("/publish-test", methods=["POST"])
@jwt_required()
def publish_test():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != UserRole.TEACHER:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json(silent=True) or {}
    test_id = data.get("test_id")
    classes = data.get("classes")  # JSON List of classes, e.g. ["Class 10", "Class 9"]

    if not test_id or not classes:
        return jsonify({"error": "Test ID and target classes are required"}), 400

    test = Test.query.filter_by(id=test_id, creator_id=user_id).first()
    if not test:
        return jsonify({"error": "Test not found"}), 404

    # Publish for each class
    for class_name in classes:
        # Create published test join record
        pub = PublishedTest(
            test_id=test_id,
            class_name=class_name,
            published_by=user_id
        )
        db.session.add(pub)

        # Create notifications for students of target classes
        target_class = Class.query.filter_by(name=class_name).first()
        if target_class:
            students = Student.query.filter_by(class_id=target_class.id).all()
            for s in students:
                noti = Notification(
                    user_id=s.user_id,
                    title="New Exam Assigned!",
                    message=f"A new test '{test.title}' in {test.subject} has been published to your class."
                )
                db.session.add(noti)

    db.session.commit()
    return jsonify({"message": f"Test published to classes: {', '.join(classes)} successfully."}), 200


@api_bp.route("/tests", methods=["GET"])
@jwt_required()
def get_tests():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == UserRole.TEACHER:
        # Teachers see all tests they created
        tests = Test.query.filter_by(creator_id=user_id).all()
        return jsonify({"tests": [t.to_dict(include_questions=True) for t in tests]}), 200
    
    elif user.role == UserRole.STUDENT:
        # Students see tests published to their specific Class
        student_profile = user.student_profile
        if not student_profile or not student_profile.class_id:
            return jsonify({"tests": []}), 200
        
        class_name = student_profile.student_class.name
        pubs = PublishedTest.query.filter_by(class_name=class_name).all()
        test_ids = [p.test_id for p in pubs]
        
        tests = Test.query.filter(Test.id.in_(test_ids)).all() if test_ids else []
        results = Result.query.filter_by(student_id=user_id).all()
        completed_test_ids = {r.test_id for r in results if r.status == "completed"}
        
        test_dicts = []
        for t in tests:
            td = t.to_dict()
            td["has_completed"] = t.id in completed_test_ids
            # Check started status
            started_res = Result.query.filter_by(student_id=user_id, test_id=t.id, status="started").first()
            td["is_started"] = started_res is not None
            test_dicts.append(td)
            
        return jsonify({"tests": test_dicts}), 200

    return jsonify({"tests": []}), 200


# ─── Exam Module Operations ─────────────────────────────────────────────────

@api_bp.route("/start-test", methods=["POST"])
@jwt_required()
def start_test():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    test_id = data.get("test_id")

    test = Test.query.get(test_id)
    if not test:
        return jsonify({"error": "Test not found"}), 404

    # Check if already completed
    existing_result = Result.query.filter_by(student_id=user_id, test_id=test_id).first()
    if existing_result and existing_result.status == "completed":
        return jsonify({"error": "You have already completed this test"}), 400

    if not existing_result:
        # Create Result placeholder
        existing_result = Result(
            student_id=user_id,
            test_id=test_id,
            status="started",
            total_questions=test.total_questions
        )
        db.session.add(existing_result)
        db.session.commit()

    # Return test questions but hide correct answer to prevent cheating
    questions = Question.query.filter_by(test_id=test_id).all()
    questions_data = []
    for q in questions:
        qd = q.to_dict()
        qd.pop("correct_option", None)
        qd.pop("explanation", None)
        # Fetch pre-saved answer if any
        ans = StudentAnswer.query.filter_by(result_id=existing_result.id, question_id=q.id).first()
        qd["selected_option"] = ans.selected_option if ans else ""
        questions_data.append(qd)

    return jsonify({
        "message": "Test started successfully",
        "result_id": existing_result.id,
        "test": test.to_dict(),
        "questions": questions_data
    }), 200


@api_bp.route("/save-answer", methods=["POST"])
@jwt_required()
def save_answer():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    result_id = data.get("result_id")
    question_id = data.get("question_id")
    selected_option = data.get("selected_option")  # A | B | C | D

    result = Result.query.filter_by(id=result_id, student_id=user_id).first()
    if not result or result.status == "completed":
        return jsonify({"error": "Invalid attempt state"}), 400

    # Save or update answer
    ans = StudentAnswer.query.filter_by(result_id=result_id, question_id=question_id).first()
    if ans:
        ans.selected_option = selected_option
    else:
        ans = StudentAnswer(
            result_id=result_id,
            question_id=question_id,
            selected_option=selected_option
        )
        db.session.add(ans)
    db.session.commit()

    return jsonify({"message": "Answer saved successfully"}), 200


@api_bp.route("/submit-test", methods=["POST"])
@jwt_required()
def submit_test():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    result_id = data.get("result_id")

    result = Result.query.filter_by(id=result_id, student_id=user_id).first()
    if not result:
        return jsonify({"error": "Test attempt not found"}), 404

    if result.status == "completed":
        return jsonify({"error": "Test already submitted"}), 400

    test = Test.query.get(result.test_id)
    questions = Question.query.filter_by(test_id=test.id).all()
    q_map = {q.id: q for q in questions}

    # Evaluate Answers
    answers = StudentAnswer.query.filter_by(result_id=result_id).all()
    ans_map = {a.question_id: a.selected_option for a in answers}

    correct = 0
    wrong = 0
    skipped = 0

    for q_id, q in q_map.items():
        selected = ans_map.get(q_id)
        if not selected:
            skipped += 1
        elif selected.upper() == q.correct_option.upper():
            correct += 1
        else:
            wrong += 1

    attempted = correct + wrong
    marks_obtained = (correct * test.correct_marks) - (wrong * test.negative_marks)
    marks_obtained = max(0.0, marks_obtained)

    total_marks = test.total_questions * test.correct_marks
    percentage = (marks_obtained / total_marks) * 100 if total_marks > 0 else 0.0

    # Grade boundary mapping
    if percentage >= 90: grade = "A+"
    elif percentage >= 80: grade = "A"
    elif percentage >= 70: grade = "B"
    elif percentage >= 60: grade = "C"
    elif percentage >= 50: grade = "D"
    else: grade = "F"

    # Save details
    result.status = "completed"
    result.attempted = attempted
    result.correct = correct
    result.wrong = wrong
    result.skipped = skipped
    result.marks_obtained = marks_obtained
    result.percentage = round(percentage, 2)
    result.grade = grade
    result.completed_at = datetime.now(timezone.utc)

    db.session.commit()

    # Dynamic Class & School Rank Computation
    all_school_results = Result.query.filter_by(test_id=test.id, status="completed")\
        .order_by(Result.marks_obtained.desc()).all()
    
    for idx, r in enumerate(all_school_results):
        r.school_rank = idx + 1
        
        # Calculate class rank
        student_user = User.query.get(r.student_id)
        if student_user and student_user.student_profile:
            class_id = student_user.student_profile.class_id
            # Get other results from the same class
            same_class_student_ids = [s.user_id for s in Student.query.filter_by(class_id=class_id).all()]
            class_results = [cr for cr in all_school_results if cr.student_id in same_class_student_ids]
            # sort and find rank
            sorted_class_results = sorted(class_results, key=lambda x: x.marks_obtained, reverse=True)
            r.class_rank = sorted_class_results.index(r) + 1
            
    db.session.commit()

    return jsonify({
        "message": "Test submitted successfully",
        "result": result.to_dict()
    }), 200


@api_bp.route("/result", methods=["GET"])
@jwt_required()
def get_result():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    test_id = request.args.get("test_id")
    result_id = request.args.get("result_id")

    if result_id:
        result = Result.query.get(result_id)
        if not result:
            return jsonify({"error": "Result not found"}), 404
        # Return full details including explanations for completed exams
        questions = Question.query.filter_by(test_id=result.test_id).all()
        answers = StudentAnswer.query.filter_by(result_id=result.id).all()
        ans_map = {a.question_id: a.selected_option for a in answers}
        
        q_list = []
        for q in questions:
            qd = q.to_dict()
            qd["selected_option"] = ans_map.get(q.id, "")
            q_list.append(qd)
            
        res_data = result.to_dict()
        res_data["questions"] = q_list
        return jsonify({"result": res_data}), 200

    if user.role == UserRole.TEACHER:
        # Teachers see list of student results for their tests
        tests = Test.query.filter_by(creator_id=user_id).all()
        t_ids = [t.id for t in tests]
        results = Result.query.filter(Result.test_id.in_(t_ids)).all() if t_ids else []
        results_data = []
        for r in results:
            rd = r.to_dict()
            student_user = User.query.get(r.student_id)
            rd["student_name"] = student_user.full_name if student_user else "Unknown student"
            rd["roll_number"] = student_user.student_profile.roll_number if student_user and student_user.student_profile else "N/A"
            results_data.append(rd)
        return jsonify({"results": results_data}), 200

    else:
        # Students see their own results
        results = Result.query.filter_by(student_id=user_id, status="completed").all()
        return jsonify({"results": [r.to_dict() for r in results]}), 200


# ─── ERP Dashboard Stats ────────────────────────────────────────────────────

@api_bp.route("/dashboard/stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == UserRole.ADMIN:
        total_students = User.query.filter_by(role=UserRole.STUDENT).count()
        total_teachers = User.query.filter_by(role=UserRole.TEACHER).count()
        total_tests = Test.query.count()
        total_admissions = Admission.query.count()

        # Real recent activities from audit log
        from app.models import AuditLog
        from datetime import datetime, timezone
        audit_entries = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(5).all()
        recent_activities = []
        for entry in audit_entries:
            action_map = {
                "USER_REGISTERED": "New user registered",
                "USER_LOGIN": "User logged in",
                "ADMISSION_FORM_SUBMITTED": "Admission form submitted",
                "ADMISSION_STATUS_UPDATED": "Admission status updated",
                "TEST_CREATED": "A new AI test was created",
                "TEST_PUBLISHED": "A test was published to students",
                "TEST_SUBMITTED": "Student submitted an exam",
            }
            text = action_map.get(entry.action, entry.action.replace("_", " ").title())
            # Human-readable time diff
            now = datetime.now(timezone.utc)
            created = entry.created_at.replace(tzinfo=timezone.utc) if entry.created_at.tzinfo is None else entry.created_at
            diff = now - created
            if diff.total_seconds() < 3600:
                time_str = f"{int(diff.total_seconds() // 60)} minutes ago"
            elif diff.total_seconds() < 86400:
                time_str = f"{int(diff.total_seconds() // 3600)} hours ago"
            else:
                time_str = f"{diff.days} days ago"
            recent_activities.append({"text": text, "time": time_str})

        return jsonify({
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_tests": total_tests,
            "total_admissions": total_admissions,
            "recent_activities": recent_activities
        }), 200

    elif user.role == UserRole.TEACHER:
        created_tests = Test.query.filter_by(creator_id=user_id).count()
        # Only count results for tests this teacher created
        teacher_test_ids = [t.id for t in Test.query.filter_by(creator_id=user_id).all()]
        total_evaluated = Result.query.filter(
            Result.test_id.in_(teacher_test_ids), Result.status == "completed"
        ).count() if teacher_test_ids else 0

        # Real classes this teacher has published tests to
        published_class_names = db.session.query(PublishedTest.class_name).filter(
            PublishedTest.test_id.in_(teacher_test_ids)
        ).distinct().all() if teacher_test_ids else []
        classes_taught = [c[0] for c in published_class_names]

        # Real count of students enrolled in those classes
        from app.models import Student, Class
        total_students_enrolled = 0
        for class_name in classes_taught:
            cls = Class.query.filter_by(name=class_name).first()
            if cls:
                total_students_enrolled += Student.query.filter_by(class_id=cls.id).count()

        return jsonify({
            "created_tests": created_tests,
            "total_evaluated": total_evaluated,
            "classes_taught": len(classes_taught),
            "total_students_enrolled": total_students_enrolled
        }), 200

    elif user.role == UserRole.STUDENT:
        assigned_count = 0
        student_profile = user.student_profile
        if student_profile and student_profile.class_id:
            class_name = student_profile.student_class.name
            assigned_count = PublishedTest.query.filter_by(class_name=class_name).count()

        completed_count = Result.query.filter_by(student_id=user_id, status="completed").count()
        pending_count = max(0, assigned_count - completed_count)
        
        # Calculate average score
        student_results = Result.query.filter_by(student_id=user_id, status="completed").all()
        avg_score = 0.0
        if student_results:
            avg_score = sum(r.percentage for r in student_results) / len(student_results)

        return jsonify({
            "assigned_tests": assigned_count,
            "completed_tests": completed_count,
            "pending_tests": pending_count,
            "average_score": round(avg_score, 1)
        }), 200

    return jsonify({"error": "Invalid role"}), 400


# ─── ERP Notifications ──────────────────────────────────────────────────────

@api_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notis = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify({"notifications": [n.to_dict() for n in notis]}), 200


@api_bp.route("/notifications/read", methods=["POST"])
@jwt_required()
def mark_notifications_read():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({Notification.is_read: True})
    db.session.commit()
    return jsonify({"message": "Notifications marked as read"}), 200

@api_bp.route("/notifications/<notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    user_id = get_jwt_identity()
    noti = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not noti:
        return jsonify({"error": "Notification not found"}), 404
    db.session.delete(noti)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200


# ─── Attendance ───────────────────────────────────────────────────────────────

@api_bp.route("/attendance", methods=["GET"])
@jwt_required()
def get_attendance():
    user_id = get_jwt_identity()
    records = Attendance.query.filter_by(student_id=user_id).order_by(Attendance.date.desc()).all()
    total = len(records)
    present = sum(1 for r in records if r.status == "present")
    absent = sum(1 for r in records if r.status == "absent")
    late = sum(1 for r in records if r.status == "late")
    percentage = round((present / total * 100), 1) if total > 0 else 0
    return jsonify({
        "records": [r.to_dict() for r in records],
        "summary": {"total": total, "present": present, "absent": absent, "late": late, "percentage": percentage}
    }), 200


@api_bp.route("/attendance", methods=["POST"])
@jwt_required()
def mark_attendance():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in (UserRole.TEACHER, UserRole.ADMIN):
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id")
    date = data.get("date")
    status = data.get("status", "present")
    subject = data.get("subject", "")
    if not student_id or not date:
        return jsonify({"error": "student_id and date are required"}), 400
    existing = Attendance.query.filter_by(student_id=student_id, date=date, subject=subject).first()
    if existing:
        existing.status = status
        db.session.commit()
        return jsonify({"message": "Attendance updated", "record": existing.to_dict()}), 200
    record = Attendance(student_id=student_id, date=date, status=status, subject=subject, marked_by=user_id)
    db.session.add(record)
    db.session.commit()
    return jsonify({"message": "Attendance marked", "record": record.to_dict()}), 201


# ─── Homework ─────────────────────────────────────────────────────────────────

@api_bp.route("/homework", methods=["GET"])
@jwt_required()
def get_homework():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role == UserRole.STUDENT:
        class_name = user.student_profile.student_class.name if (user.student_profile and user.student_profile.student_class) else None
        if not class_name:
            return jsonify({"homework": [], "submissions": {}}), 200
        hw_list = Homework.query.filter_by(class_name=class_name).order_by(Homework.due_date.asc()).all()
        submission_map = {}
        for hw in hw_list:
            sub = HomeworkSubmission.query.filter_by(homework_id=hw.id, student_id=user_id).first()
            submission_map[hw.id] = sub.to_dict() if sub else None
        return jsonify({"homework": [h.to_dict() for h in hw_list], "submissions": submission_map}), 200
    else:
        hw_list = Homework.query.filter_by(assigned_by=user_id).order_by(Homework.created_at.desc()).all()
        return jsonify({"homework": [h.to_dict() for h in hw_list]}), 200


@api_bp.route("/homework", methods=["POST"])
@jwt_required()
def create_homework():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in (UserRole.TEACHER, UserRole.ADMIN):
        return jsonify({"error": "Only teachers can assign homework"}), 403
    data = request.get_json(silent=True) or {}
    title = sanitize_string(data.get("title", ""), 255)
    subject = sanitize_string(data.get("subject", ""), 255)
    class_name = sanitize_string(data.get("class_name", ""), 255)
    due_date = data.get("due_date", "")
    description = data.get("description", "")
    max_marks = float(data.get("max_marks", 10.0))
    if not title or not subject or not class_name or not due_date:
        return jsonify({"error": "title, subject, class_name, due_date are required"}), 400
    hw = Homework(title=title, subject=subject, description=description,
                  due_date=due_date, class_name=class_name, assigned_by=user_id, max_marks=max_marks)
    db.session.add(hw)
    db.session.commit()
    # Notify students in that class
    students_in_class = Student.query.join(Class).filter(Class.name == class_name).all()
    for s in students_in_class:
        notif = Notification(user_id=s.user_id, title=f"New Homework: {title}",
                             message=f"New {subject} homework assigned. Due: {due_date}")
        db.session.add(notif)
    db.session.commit()
    return jsonify({"message": "Homework assigned", "homework": hw.to_dict()}), 201


@api_bp.route("/homework/<hw_id>/submit", methods=["POST"])
@jwt_required()
def submit_homework(hw_id):
    user_id = get_jwt_identity()
    hw = Homework.query.get(hw_id)
    if not hw:
        return jsonify({"error": "Homework not found"}), 404
    existing = HomeworkSubmission.query.filter_by(homework_id=hw_id, student_id=user_id).first()
    data = request.get_json(silent=True) or {}
    notes = data.get("notes", "")
    if existing:
        existing.notes = notes
        existing.status = "submitted"
        existing.submitted_at = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify({"message": "Submission updated", "submission": existing.to_dict()}), 200
    sub = HomeworkSubmission(homework_id=hw_id, student_id=user_id, notes=notes)
    db.session.add(sub)
    db.session.commit()
    return jsonify({"message": "Homework submitted", "submission": sub.to_dict()}), 201


# ─── Study Materials ──────────────────────────────────────────────────────────

@api_bp.route("/study-materials", methods=["GET"])
@jwt_required()
def get_study_materials():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role == UserRole.STUDENT:
        class_name = user.student_profile.student_class.name if (user.student_profile and user.student_profile.student_class) else None
        materials = StudyMaterial.query.filter(
            (StudyMaterial.class_name == class_name) | (StudyMaterial.class_name == "All")
        ).order_by(StudyMaterial.created_at.desc()).all()
    else:
        materials = StudyMaterial.query.filter_by(uploaded_by=user_id).order_by(StudyMaterial.created_at.desc()).all()
    return jsonify({"materials": [m.to_dict() for m in materials]}), 200


@api_bp.route("/study-materials", methods=["POST"])
@jwt_required()
def upload_study_material():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in (UserRole.TEACHER, UserRole.ADMIN):
        return jsonify({"error": "Only teachers can upload materials"}), 403
    data = request.get_json(silent=True) or {}
    title = sanitize_string(data.get("title", ""), 255)
    subject = sanitize_string(data.get("subject", ""), 255)
    class_name = sanitize_string(data.get("class_name", "All"), 255)
    material_type = sanitize_string(data.get("material_type", "pdf"), 50)
    description = data.get("description", "")
    file_url = data.get("file_url", "")
    if not title or not subject:
        return jsonify({"error": "title and subject are required"}), 400
    mat = StudyMaterial(title=title, subject=subject, class_name=class_name,
                        material_type=material_type, description=description,
                        file_url=file_url, uploaded_by=user_id)
    db.session.add(mat)
    db.session.commit()
    return jsonify({"message": "Material uploaded", "material": mat.to_dict()}), 201


# ─── Leaderboard ─────────────────────────────────────────────────────────────

@api_bp.route("/leaderboard", methods=["GET"])
@jwt_required()
def get_leaderboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    class_name = None
    if user.role == UserRole.STUDENT and user.student_profile and user.student_profile.student_class:
        class_name = user.student_profile.student_class.name
    # Get all students in same class
    if class_name:
        class_students = Student.query.join(Class).filter(Class.name == class_name).all()
        student_ids = [s.user_id for s in class_students]
    else:
        student_ids = [user_id]
    leaderboard = []
    for sid in student_ids:
        s_user = User.query.get(sid)
        if not s_user:
            continue
        results = Result.query.filter_by(student_id=sid, status="completed").all()
        if not results:
            avg_score = 0
            best_grade = "N/A"
            completed = 0
        else:
            avg_score = round(sum(r.percentage for r in results) / len(results), 1)
            grades = [r.grade for r in results if r.grade]
            grade_order = {"A+": 6, "A": 5, "B": 4, "C": 3, "D": 2, "F": 1}
            best_grade = max(grades, key=lambda g: grade_order.get(g, 0)) if grades else "N/A"
            completed = len(results)
        roll = s_user.student_profile.roll_number if s_user.student_profile else ""
        leaderboard.append({
            "student_id": sid,
            "student_name": s_user.full_name,
            "roll_number": roll,
            "avg_score": avg_score,
            "completed_tests": completed,
            "best_grade": best_grade,
        })
    leaderboard.sort(key=lambda x: x["avg_score"], reverse=True)
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
    my_entry = next((e for e in leaderboard if e["student_id"] == user_id), None)
    return jsonify({"leaderboard": leaderboard, "my_rank": my_entry}), 200


# ─── AI Study Chat ────────────────────────────────────────────────────────────

@api_bp.route("/student/ai-chat", methods=["POST"])
@jwt_required()
def student_ai_chat():
    import requests as req_lib
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"error": "Message is required"}), 400
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return jsonify({"reply": "AI assistant is not configured. Please add a GEMINI_API_KEY to the backend .env file."}), 200
    system_prompt = (
        f"You are a helpful, friendly AI study assistant for a school student named {user.full_name}. "
        "You help students understand school subjects, explain concepts clearly, generate practice MCQs, "
        "create study notes, help with homework problems, and prepare for exams. "
        "Keep your responses concise, educational, and encouraging. "
        "Use bullet points and clear formatting where helpful."
    )
    models_to_try = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"]
    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {"contents": [{"role": "user", "parts": [{"text": f"{system_prompt}\n\nStudent question: {message}"}]}]}
        try:
            resp = req_lib.post(url, json=payload, timeout=30)
            if resp.status_code == 200:
                reply_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                return jsonify({"reply": reply_text}), 200
            elif resp.status_code in (429, 503):
                continue
        except Exception:
            continue
    return jsonify({"reply": "Sorry, the AI is currently busy. Please try again in a moment."}), 200

# ─── New Endpoints for Full Functionality ─────────────────────────────────────

@api_bp.route("/user/password", methods=["PUT"])
@jwt_required()
def update_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not bcrypt.check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Incorrect current password"}), 400
        
    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200

@api_bp.route("/calendar/events", methods=["GET"])
@jwt_required()
def get_calendar_events():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    events = []
    
    if user.role == UserRole.STUDENT:
        class_name = user.student_profile.student_class.name if user.student_profile and user.student_profile.student_class else None
        
        # 1. Exams
        if class_name:
            tests = PublishedTest.query.filter_by(class_name=class_name).all()
            for pt in tests:
                events.append({
                    "id": f"exam_{pt.test.id}",
                    "title": pt.test.title,
                    "date": pt.published_at.strftime("%Y-%m-%d"),
                    "type": "exam",
                    "subject": pt.test.subject
                })
                
        # 2. Homework
        if class_name:
            hws = Homework.query.filter_by(class_name=class_name).all()
            for hw in hws:
                events.append({
                    "id": f"hw_{hw.id}",
                    "title": f"HW Due: {hw.title}",
                    "date": hw.due_date,
                    "type": "homework",
                    "subject": hw.subject
                })
                
    # 3. Announcements/Holidays (mocking for now since we don't have a holiday table)
    return jsonify({"events": events}), 200

@api_bp.route("/study-materials/<material_id>/download", methods=["POST"])
@jwt_required()
def download_material(material_id):
    mat = StudyMaterial.query.get(material_id)
    if not mat:
        return jsonify({"error": "Material not found"}), 404
    mat.download_count += 1
    db.session.commit()
    return jsonify({"message": "Download count updated"}), 200

@api_bp.route("/notifications/read-all", methods=["PUT"])
@jwt_required()
def mark_all_notifications_read():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({Notification.is_read: True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200

@api_bp.route("/dashboard/analytics", methods=["GET"])
@jwt_required()
def get_dashboard_analytics():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if user.role != UserRole.STUDENT:
        return jsonify({"error": "Unauthorized"}), 403

    # Generate performance trend from past Results
    results = Result.query.filter_by(student_id=user_id, status="completed").order_by(Result.completed_at.asc()).all()
    performance_trend = []
    for r in results:
        performance_trend.append({
            "name": r.test.title if r.test else f"Test {r.id[:4]}",
            "score": r.percentage
        })
        
    # Attendance Data
    attendance_records = Attendance.query.filter_by(student_id=user_id).all()
    present_count = sum(1 for a in attendance_records if a.status == "present")
    absent_count = sum(1 for a in attendance_records if a.status == "absent")
    late_count = sum(1 for a in attendance_records if a.status == "late")
    
    attendance_data = [
        {"name": "Present", "value": present_count, "color": "#10B981"},
        {"name": "Absent", "value": absent_count, "color": "#EF4444"},
        {"name": "Late", "value": late_count, "color": "#F59E0B"}
    ]
    
    return jsonify({
        "performance_trend": performance_trend,
        "attendance_data": attendance_data
    }), 200
