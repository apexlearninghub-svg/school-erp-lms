import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from run import seed_database

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()
    seed_database()
    print("Database completely reset and seeded.")
