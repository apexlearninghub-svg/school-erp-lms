from app import create_app, db, bcrypt
from app.models import User, UserRole, Admission, Class, Student, Teacher, Parent

app = create_app()

def seed_database():
    # 1. Seed Classes
    class_names = [f"Class {i}" for i in range(1, 13)]
    for name in class_names:
        if Class.query.filter_by(name=name).first() is None:
            c = Class(name=name)
            db.session.add(c)
    db.session.commit()

    # 2. Seed Users
    if User.query.first() is None:
        print("Seeding database with demo users...")
        demo_users = [
            {"username": "admin", "email": "admin@apexhub.edu", "full_name": "System Administrator", "role": UserRole.ADMIN},
            {"username": "teacher", "email": "teacher@apexhub.edu", "full_name": "John Doe (Teacher)", "role": UserRole.TEACHER},
            {"username": "student", "email": "student@apexhub.edu", "full_name": "Jane Smith (Student)", "role": UserRole.STUDENT},
            {"username": "parent", "email": "parent@apexhub.edu", "full_name": "Robert Smith (Parent)", "role": UserRole.PARENT},
        ]
        password_hash = bcrypt.generate_password_hash("Demo@1234").decode("utf-8")
        
        default_class = Class.query.filter_by(name="Class 10").first()

        for u_data in demo_users:
            user = User(
                username=u_data["username"],
                email=u_data["email"],
                full_name=u_data["full_name"],
                role=u_data["role"],
                password_hash=password_hash,
                is_verified=True,
                is_active=True
            )
            db.session.add(user)
            db.session.flush()

            # Create profiles
            if user.role == UserRole.STUDENT:
                student = Student(
                    user_id=user.id,
                    father_name="Robert Smith Senior",
                    mother_name="Mary Smith",
                    class_id=default_class.id if default_class else None,
                    roll_number="S101"
                )
                db.session.add(student)
            elif user.role == UserRole.TEACHER:
                teacher = Teacher(
                    user_id=user.id,
                    employee_id="TCH101",
                    designation="Senior Lecturer",
                    department="Science"
                )
                db.session.add(teacher)
            elif user.role == UserRole.PARENT:
                parent = Parent(
                    user_id=user.id,
                    occupation="Software Engineer",
                    phone_number="+1234567890",
                    address="123 System Lane"
                )
                db.session.add(parent)

            # Create mock admission for demo user (Approved)
            admission = Admission(
                user_id=user.id,
                student_name=user.full_name,
                father_name="Demo Father",
                mother_name="Demo Mother",
                email=user.email,
                phone="1234567890",
                dob="2000-01-01",
                gender="Other",
                address="123 System Lane",
                class_applied="Class 10",
                status="approved",
                photo="/api/user/avatar/placeholder.jpg",
                aadhaar_card="/api/user/avatar/placeholder_aadhaar.jpg"
            )
            db.session.add(admission)
        db.session.commit()
        
        # Link demo parent to demo student
        demo_student = User.query.filter_by(username="student").first()
        demo_parent = User.query.filter_by(username="parent").first()
        if demo_student and demo_parent:
            p_profile = demo_parent.parent_profile
            if p_profile:
                p_profile.student_id = demo_student.id
                db.session.commit()
                
        print("Database seeding completed.")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_database()
    app.run(debug=True, host="0.0.0.0", port=5000)
    