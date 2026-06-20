from app import create_app, db
from run import seed_database
from seed_data import seed_extra_data

app = create_app()

with app.app_context():
    print("1. Creating all tables...")
    db.create_all()
    print("2. Seeding basic users and classes...")
    seed_database()
    print("3. Seeding advanced LMS data (homework, materials)...")
    seed_extra_data()
    print("FINISHED ALL SEEDING!")
