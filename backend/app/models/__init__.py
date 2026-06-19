import uuid
from datetime import datetime, timezone
from app import db


class UserRole:
    ADMIN = "admin"
    PRINCIPAL = "principal"
    TEACHER = "teacher"
    STUDENT = "student"
    PARENT = "parent"
    STAFF = "staff"
    ACCOUNTANT = "accountant"

    ALL = [ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, STAFF, ACCOUNTANT]


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(50), nullable=False, default=UserRole.STUDENT)
    avatar = db.Column(db.String(500), nullable=True)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    last_login = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    otp_tokens = db.relationship("OTPToken", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")
    login_history = db.relationship("LoginHistory", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")
    audit_logs = db.relationship("AuditLog", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")
    admission = db.relationship("Admission", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    student_profile = db.relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    teacher_profile = db.relationship("Teacher", back_populates="user", uselist=False, cascade="all, delete-orphan")
    parent_profile = db.relationship("Parent", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="Parent.user_id")
    staff_profile = db.relationship("Staff", back_populates="user", uselist=False, cascade="all, delete-orphan")
    results = db.relationship("Result", back_populates="student", lazy="dynamic", cascade="all, delete-orphan")
    notifications = db.relationship("Notification", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, include_sensitive=False):
        data = {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "username": self.username,
            "role": self.role,
            "avatar": self.avatar,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "has_submitted_admission": self.admission is not None,
            "admission_status": self.admission.status if self.admission else None
        }
        if self.admission:
            data["phone"] = self.admission.phone
        else:
            data["phone"] = None

        if self.role == UserRole.STUDENT and self.student_profile:
            data["student_profile"] = {
                "father_name": self.student_profile.father_name,
                "mother_name": self.student_profile.mother_name,
                "class_name": self.student_profile.student_class.name if self.student_profile.student_class else None,
                "roll_number": self.student_profile.roll_number,
                "address": self.admission.address if self.admission else None,
                "parent_phone": self.admission.emergency_phone if self.admission else None
            }
        elif self.role == UserRole.TEACHER and self.teacher_profile:
            data["teacher_profile"] = {
                "employee_id": self.teacher_profile.employee_id,
                "designation": self.teacher_profile.designation,
                "department": self.teacher_profile.department
            }
            
        return data

    def get_dashboard_url(self):
        routes = {
            UserRole.ADMIN: "/admin/dashboard",
            UserRole.TEACHER: "/teacher/dashboard",
            UserRole.STUDENT: "/student/dashboard",
            UserRole.PARENT: "/parent/dashboard",
        }
        return routes.get(self.role, "/dashboard")


class OTPToken(db.Model):
    __tablename__ = "otp_tokens"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(6), nullable=False)
    purpose = db.Column(db.String(50), nullable=False, default="password_reset")
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="otp_tokens")


class LoginHistory(db.Model):
    __tablename__ = "login_history"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    device = db.Column(db.String(255), nullable=True)
    browser = db.Column(db.String(100), nullable=True)
    os = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    success = db.Column(db.Boolean, default=True)
    method = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="login_history")

    def to_dict(self):
        return {
            "id": self.id,
            "ip_address": self.ip_address,
            "device": self.device,
            "browser": self.browser,
            "os": self.os,
            "location": self.location,
            "success": self.success,
            "method": self.method,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(255), nullable=False)
    details = db.Column(db.JSON, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="audit_logs")


class Admission(db.Model):
    __tablename__ = "admissions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), unique=True, nullable=False)
    
    # Personal Info
    student_name = db.Column(db.String(255), nullable=False)
    father_name = db.Column(db.String(255), nullable=True)
    mother_name = db.Column(db.String(255), nullable=True)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    dob = db.Column(db.String(50), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    blood_group = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default="pending")  # pending | approved | rejected
    
    # Professional Details (If Teacher)
    employee_id = db.Column(db.String(100), nullable=True)
    designation = db.Column(db.String(100), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    joining_date = db.Column(db.String(100), nullable=True)
    experience = db.Column(db.String(100), nullable=True)
    specialization = db.Column(db.String(100), nullable=True)
    
    # Educational Details (If Teacher)
    highest_qualification = db.Column(db.String(100), nullable=True)
    university = db.Column(db.String(100), nullable=True)
    graduation_year = db.Column(db.String(50), nullable=True)
    certifications = db.Column(db.Text, nullable=True)
    
    # Emergency Contact
    emergency_name = db.Column(db.String(255), nullable=True)
    emergency_phone = db.Column(db.String(50), nullable=True)
    emergency_relation = db.Column(db.String(100), nullable=True)
    
    # Documents
    photo = db.Column(db.Text, nullable=True)
    aadhaar_card = db.Column(db.Text, nullable=True)
    resume = db.Column(db.Text, nullable=True)
    pan_card = db.Column(db.Text, nullable=True)
    other_docs = db.Column(db.Text, nullable=True)

    # Legacy / Student field
    class_applied = db.Column(db.String(100), nullable=True)
    previous_gpa = db.Column(db.String(50), nullable=True)
    guardian_name = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user = db.relationship("User", back_populates="admission")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "student_name": self.student_name,
            "father_name": self.father_name,
            "mother_name": self.mother_name,
            "email": self.email,
            "phone": self.phone,
            "dob": self.dob,
            "gender": self.gender,
            "blood_group": self.blood_group,
            "address": self.address,
            "status": self.status,
            "employee_id": self.employee_id,
            "designation": self.designation,
            "department": self.department,
            "joining_date": self.joining_date,
            "experience": self.experience,
            "specialization": self.specialization,
            "highest_qualification": self.highest_qualification,
            "university": self.university,
            "graduation_year": self.graduation_year,
            "certifications": self.certifications,
            "emergency_name": self.emergency_name,
            "emergency_phone": self.emergency_phone,
            "emergency_relation": self.emergency_relation,
            "photo": self.photo,
            "aadhaar_card": self.aadhaar_card,
            "resume": self.resume,
            "pan_card": self.pan_card,
            "other_docs": self.other_docs,
            "class_applied": self.class_applied,
            "previous_gpa": self.previous_gpa,
            "guardian_name": self.guardian_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ─── ERP School Schema Extensions ───────────────────────────────────────────

class Class(db.Model):
    __tablename__ = "classes"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)  # Class 1, Class 2...

    students = db.relationship("Student", back_populates="student_class", lazy="dynamic")


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), unique=True, nullable=False)
    father_name = db.Column(db.String(255), nullable=True)
    mother_name = db.Column(db.String(255), nullable=True)
    class_id = db.Column(db.String(36), db.ForeignKey("classes.id"), nullable=True)
    roll_number = db.Column(db.String(50), nullable=True)

    user = db.relationship("User", back_populates="student_profile")
    student_class = db.relationship("Class", back_populates="students")


class Teacher(db.Model):
    __tablename__ = "teachers"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), unique=True, nullable=False)
    employee_id = db.Column(db.String(100), unique=True, nullable=True)
    designation = db.Column(db.String(100), nullable=True)
    department = db.Column(db.String(100), nullable=True)

    user = db.relationship("User", back_populates="teacher_profile")

class Parent(db.Model):
    __tablename__ = "parents"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), unique=True, nullable=False)
    student_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True) # Linked child
    occupation = db.Column(db.String(255), nullable=True)
    phone_number = db.Column(db.String(50), nullable=True)
    address = db.Column(db.Text, nullable=True)

    user = db.relationship("User", back_populates="parent_profile", foreign_keys=[user_id])
    student = db.relationship("User", foreign_keys=[student_id])

class Staff(db.Model):
    __tablename__ = "staff"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), unique=True, nullable=False)
    employee_id = db.Column(db.String(100), unique=True, nullable=True)
    role_title = db.Column(db.String(100), nullable=True)
    department = db.Column(db.String(100), nullable=True)

    user = db.relationship("User", back_populates="staff_profile")

class Section(db.Model):
    __tablename__ = "sections"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(50), nullable=False)
    class_id = db.Column(db.String(36), db.ForeignKey("classes.id"), nullable=False)
    capacity = db.Column(db.Integer, nullable=True, default=40)

    student_class = db.relationship("Class", foreign_keys=[class_id])

class Subject(db.Model):
    __tablename__ = "subjects"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=True)
    description = db.Column(db.Text, nullable=True)


# ─── AI Test Generator & Exams Schema ───────────────────────────────────────

class Test(db.Model):
    __tablename__ = "tests"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False, default="medium")  # easy | medium | hard
    duration = db.Column(db.Integer, nullable=False, default=30)  # in minutes
    total_questions = db.Column(db.Integer, nullable=False, default=10)
    correct_marks = db.Column(db.Float, nullable=False, default=1.0)
    negative_marks = db.Column(db.Float, nullable=False, default=0.0)
    passing_marks = db.Column(db.Float, nullable=False, default=4.0)
    is_timed = db.Column(db.Boolean, nullable=False, default=True)
    creator_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    questions = db.relationship("Question", back_populates="test", lazy="dynamic", cascade="all, delete-orphan")
    publications = db.relationship("PublishedTest", back_populates="test", lazy="dynamic", cascade="all, delete-orphan")
    results = db.relationship("Result", back_populates="test", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, include_questions=False):
        data = {
            "id": self.id,
            "title": self.title,
            "subject": self.subject,
            "difficulty": self.difficulty,
            "duration": self.duration,
            "total_questions": self.total_questions,
            "correct_marks": self.correct_marks,
            "negative_marks": self.negative_marks,
            "passing_marks": self.passing_marks,
            "is_timed": self.is_timed,
            "creator_id": self.creator_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_questions:
            data["questions"] = [q.to_dict() for q in self.questions]
        return data


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id = db.Column(db.String(36), db.ForeignKey("tests.id"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(500), nullable=False)
    option_b = db.Column(db.String(500), nullable=False)
    option_c = db.Column(db.String(500), nullable=False)
    option_d = db.Column(db.String(500), nullable=False)
    correct_option = db.Column(db.String(5), nullable=False)  # A | B | C | D
    explanation = db.Column(db.Text, nullable=True)

    test = db.relationship("Test", back_populates="questions")

    def to_dict(self):
        return {
            "id": self.id,
            "test_id": self.test_id,
            "question_text": self.question_text,
            "option_a": self.option_a,
            "option_b": self.option_b,
            "option_c": self.option_c,
            "option_d": self.option_d,
            "correct_option": self.correct_option,
            "explanation": self.explanation,
        }


class PublishedTest(db.Model):
    __tablename__ = "published_tests"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id = db.Column(db.String(36), db.ForeignKey("tests.id"), nullable=False)
    class_name = db.Column(db.String(255), nullable=False)  # "Class 1", "Class 2" or comma-separated
    published_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    published_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    test = db.relationship("Test", back_populates="publications")


class StudentAnswer(db.Model):
    __tablename__ = "student_answers"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    result_id = db.Column(db.String(36), db.ForeignKey("results.id"), nullable=False)
    question_id = db.Column(db.String(36), db.ForeignKey("questions.id"), nullable=False)
    selected_option = db.Column(db.String(5), nullable=True)  # A | B | C | D or null

    result = db.relationship("Result", back_populates="answers")


class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    test_id = db.Column(db.String(36), db.ForeignKey("tests.id"), nullable=False)
    
    total_questions = db.Column(db.Integer, nullable=False, default=0)
    attempted = db.Column(db.Integer, nullable=False, default=0)
    correct = db.Column(db.Integer, nullable=False, default=0)
    wrong = db.Column(db.Integer, nullable=False, default=0)
    skipped = db.Column(db.Integer, nullable=False, default=0)
    
    marks_obtained = db.Column(db.Float, nullable=False, default=0.0)
    percentage = db.Column(db.Float, nullable=False, default=0.0)
    grade = db.Column(db.String(10), nullable=True)
    
    class_rank = db.Column(db.Integer, nullable=True)
    school_rank = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="completed")  # started | completed
    
    completed_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = db.relationship("User", back_populates="results")
    test = db.relationship("Test", back_populates="results")
    answers = db.relationship("StudentAnswer", back_populates="result", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "test_id": self.test_id,
            "test_title": self.test.title if self.test else "",
            "total_questions": self.total_questions,
            "attempted": self.attempted,
            "correct": self.correct,
            "wrong": self.wrong,
            "skipped": self.skipped,
            "marks_obtained": self.marks_obtained,
            "percentage": self.percentage,
            "grade": self.grade,
            "class_rank": self.class_rank,
            "school_rank": self.school_rank,
            "status": self.status,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="notifications")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ─── Attendance ───────────────────────────────────────────────────────────────

class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    date = db.Column(db.String(20), nullable=False)           # YYYY-MM-DD
    status = db.Column(db.String(20), nullable=False, default="present")  # present | absent | late
    subject = db.Column(db.String(255), nullable=True)
    marked_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = db.relationship("User", foreign_keys=[student_id])

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "date": self.date,
            "status": self.status,
            "subject": self.subject,
            "marked_by": self.marked_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ─── Homework ─────────────────────────────────────────────────────────────────

class Homework(db.Model):
    __tablename__ = "homework"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.String(50), nullable=False)       # YYYY-MM-DD
    class_name = db.Column(db.String(255), nullable=False)    # e.g. "Class 10"
    assigned_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    max_marks = db.Column(db.Float, nullable=True, default=10.0)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    teacher = db.relationship("User", foreign_keys=[assigned_by])
    submissions = db.relationship("HomeworkSubmission", back_populates="homework", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subject": self.subject,
            "description": self.description,
            "due_date": self.due_date,
            "class_name": self.class_name,
            "assigned_by": self.assigned_by,
            "max_marks": self.max_marks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class HomeworkSubmission(db.Model):
    __tablename__ = "homework_submissions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    homework_id = db.Column(db.String(36), db.ForeignKey("homework.id"), nullable=False)
    student_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    file_url = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    marks_obtained = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="submitted")  # submitted | graded | late
    submitted_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    homework = db.relationship("Homework", back_populates="submissions")
    student = db.relationship("User", foreign_keys=[student_id])

    def to_dict(self):
        return {
            "id": self.id,
            "homework_id": self.homework_id,
            "student_id": self.student_id,
            "file_url": self.file_url,
            "notes": self.notes,
            "marks_obtained": self.marks_obtained,
            "status": self.status,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
        }


# ─── Study Materials ──────────────────────────────────────────────────────────

class StudyMaterial(db.Model):
    __tablename__ = "study_materials"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    material_type = db.Column(db.String(50), nullable=False, default="pdf")  # pdf | video | notes | paper | ppt
    description = db.Column(db.Text, nullable=True)
    file_url = db.Column(db.Text, nullable=True)
    class_name = db.Column(db.String(255), nullable=False)    # e.g. "Class 10" or "All"
    uploaded_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    download_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    uploader = db.relationship("User", foreign_keys=[uploaded_by])

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subject": self.subject,
            "material_type": self.material_type,
            "description": self.description,
            "file_url": self.file_url,
            "class_name": self.class_name,
            "uploaded_by": self.uploaded_by,
            "download_count": self.download_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

# ─── Communications ──────────────────────────────────────────────────────────

class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    target_audience = db.Column(db.String(50), nullable=False, default="all")  # all | students | parents | teachers
    class_name = db.Column(db.String(255), nullable=True)  # if specific class
    created_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    author = db.relationship("User", foreign_keys=[created_by])

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "target_audience": self.target_audience,
            "class_name": self.class_name,
            "created_by": self.created_by,
            "author_name": self.author.full_name if self.author else "Admin",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    subject = db.Column(db.String(255), nullable=True)
    body = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sender = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "sender_name": self.sender.full_name if self.sender else "Unknown",
            "receiver_name": self.receiver.full_name if self.receiver else "Unknown",
            "subject": self.subject,
            "body": self.body,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

# ─── Finance & Admin Models ───────────────────────────────────────────────────

class FeePayment(db.Model):
    __tablename__ = "fee_payments"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status = db.Column(db.String(50), nullable=False, default="completed") # pending | completed | failed
    payment_method = db.Column(db.String(50), nullable=True)
    description = db.Column(db.String(255), nullable=True)

    student = db.relationship("User", foreign_keys=[student_id])

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "amount": self.amount,
            "payment_date": self.payment_date.isoformat() if self.payment_date else None,
            "status": self.status,
            "payment_method": self.payment_method,
            "description": self.description,
            "student_name": self.student.full_name if self.student else "Unknown",
        }

class SystemSetting(db.Model):
    __tablename__ = "system_settings"

    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.Text, nullable=True)
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "key": self.key,
            "value": self.value,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class EmailVerification(db.Model):
    __tablename__ = "email_verifications"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    attempts = db.Column(db.Integer, default=0, nullable=False)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", foreign_keys=[user_id])

