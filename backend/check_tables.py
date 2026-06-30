import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get("DATABASE_URL")
if db_url:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result]
        print(f"Found {len(tables)} tables: {tables}")
else:
    print("No DATABASE_URL")
