from sqlalchemy import create_engine, text
db_url = 'postgresql+pg8000://neondb_owner:npg_Po1tDpFNCGW6@ep-billowing-bar-adtfrp6w-pooler.c-2.us-east-1.aws.neon.tech/neondb'
engine = create_engine(db_url)
with engine.connect() as conn:
    conn.execute(text("UPDATE users SET is_verified = True WHERE email = 'tester_teacher_ai_124@gmail.com'"))
    conn.commit()
    result = conn.execute(text("SELECT email, is_verified FROM users WHERE email = 'tester_teacher_ai_124@gmail.com'")).fetchone()
    print('User updated:', result)
