import os
from datetime import datetime, timedelta, timezone
import random
from app import create_app, db
from app.models import User, UserRole, Class, Student, Teacher, Test, Question, PublishedTest, Result, StudentAnswer, Notification, Attendance, Homework, HomeworkSubmission, StudyMaterial

app = create_app()

def seed_extra_data():
    with app.app_context():
        print("Starting advanced data seed...")

        teacher = User.query.filter_by(role=UserRole.TEACHER).first()
        student = User.query.filter_by(role=UserRole.STUDENT).first()
        admin = User.query.filter_by(role=UserRole.ADMIN).first()
        
        if not teacher or not student:
            print("Demo users not found. Run run.py first.")
            return

        cls = Class.query.filter_by(name="Class 10").first()
        class_name = cls.name if cls else "Class 10"

        # 1. Seed Study Materials
        print("Seeding Study Materials...")
        materials = [
            {"title": "Algebra Fundamentals", "subject": "Mathematics", "type": "pdf", "desc": "Basic algebra formulas and examples."},
            {"title": "Newton's Laws of Motion", "subject": "Physics", "type": "video", "desc": "Detailed video lecture on motion."},
            {"title": "Chemical Bonding Notes", "subject": "Chemistry", "type": "notes", "desc": "Comprehensive notes on chemical bonds."},
            {"title": "Previous Year Board Paper", "subject": "All Subjects", "type": "paper", "desc": "2024 final board examination paper."},
            {"title": "Photosynthesis Presentation", "subject": "Biology", "type": "ppt", "desc": "Slides on the photosynthesis process."}
        ]
        for m in materials:
            if not StudyMaterial.query.filter_by(title=m["title"]).first():
                mat = StudyMaterial(
                    title=m["title"],
                    subject=m["subject"],
                    material_type=m["type"],
                    description=m["desc"],
                    class_name=class_name,
                    uploaded_by=teacher.id,
                    download_count=random.randint(5, 50)
                )
                db.session.add(mat)

        # 2. Seed Homework
        print("Seeding Homework...")
        now = datetime.now(timezone.utc)
        homeworks = [
            {"title": "Math Exercises Ch 4", "subject": "Mathematics", "due": (now + timedelta(days=2)).strftime("%Y-%m-%d"), "status": "pending"},
            {"title": "Physics Lab Report", "subject": "Physics", "due": (now - timedelta(days=1)).strftime("%Y-%m-%d"), "status": "overdue"},
            {"title": "English Essay", "subject": "English", "due": (now + timedelta(days=5)).strftime("%Y-%m-%d"), "status": "submitted"},
        ]
        
        for h in homeworks:
            if not Homework.query.filter_by(title=h["title"]).first():
                hw = Homework(
                    title=h["title"],
                    subject=h["subject"],
                    description=f"Complete the assignment for {h['subject']}.",
                    due_date=h["due"],
                    class_name=class_name,
                    assigned_by=teacher.id,
                    max_marks=10.0
                )
                db.session.add(hw)
                db.session.flush()

                if h["status"] == "submitted":
                    sub = HomeworkSubmission(
                        homework_id=hw.id,
                        student_id=student.id,
                        notes="Here is my essay.",
                        status="graded",
                        marks_obtained=8.5
                    )
                    db.session.add(sub)

        # 3. Seed Attendance
        print("Seeding Attendance...")
        if Attendance.query.filter_by(student_id=student.id).count() == 0:
            for i in range(1, 30):
                d = now - timedelta(days=i)
                # Skip weekends (5=Sat, 6=Sun)
                if d.weekday() >= 5:
                    continue
                status_choice = random.choices(["present", "absent", "late"], weights=[80, 10, 10])[0]
                att = Attendance(
                    student_id=student.id,
                    date=d.strftime("%Y-%m-%d"),
                    status=status_choice,
                    marked_by=teacher.id
                )
                db.session.add(att)

        # 4. Seed Exams and Results
        print("Seeding Exams and Results...")
        if Test.query.filter_by(creator_id=teacher.id).count() < 3:
            tests_data = [
                {"title": "Midterm Mathematics", "subject": "Mathematics", "score": 85.0},
                {"title": "Physics Quiz 1", "subject": "Physics", "score": 92.5},
                {"title": "Chemistry Unit Test", "subject": "Chemistry", "score": 68.0},
                {"title": "Biology Mock Test", "subject": "Biology", "score": None} # Pending
            ]

            for td in tests_data:
                test = Test(
                    title=td["title"],
                    subject=td["subject"],
                    total_questions=10,
                    creator_id=teacher.id
                )
                db.session.add(test)
                db.session.flush()

                pub = PublishedTest(test_id=test.id, class_name=class_name, published_by=teacher.id)
                db.session.add(pub)

                if td["score"] is not None:
                    # Grade boundaries
                    perc = td["score"]
                    if perc >= 90: grade = "A+"
                    elif perc >= 80: grade = "A"
                    elif perc >= 70: grade = "B"
                    elif perc >= 60: grade = "C"
                    else: grade = "D"

                    res = Result(
                        student_id=student.id,
                        test_id=test.id,
                        total_questions=10,
                        attempted=10,
                        correct=int((perc / 100) * 10),
                        wrong=10 - int((perc / 100) * 10),
                        skipped=0,
                        marks_obtained=perc / 10,
                        percentage=perc,
                        grade=grade,
                        status="completed"
                    )
                    db.session.add(res)

        # 5. Seed Notifications
        print("Seeding Notifications...")
        if Notification.query.filter_by(user_id=student.id).count() == 0:
            notifs = [
                {"title": "Welcome to the ERP", "msg": "Your account has been successfully set up."},
                {"title": "New Homework Assigned", "msg": "Math Exercises Ch 4 is due soon."},
                {"title": "Exam Result Published", "msg": "Your score for Physics Quiz 1 is now available."},
            ]
            for n in notifs:
                notif = Notification(user_id=student.id, title=n["title"], message=n["msg"])
                db.session.add(notif)

        db.session.commit()
        print("Advanced seeding complete! Actual data has been populated.")

if __name__ == "__main__":
    seed_extra_data()
