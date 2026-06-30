import os
import pg8000.native
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("DATABASE_URL")

parts = url.replace("postgresql+pg8000://", "").split("@")
user_pass = parts[0].split(":")
host_db = parts[1].split("/")
user = user_pass[0]
password = user_pass[1]
host = host_db[0]
database = host_db[1]

conn = pg8000.native.Connection(user=user, password=password, host=host, database=database)
res_user = conn.run("SELECT id FROM users WHERE email='fake222@dyleris.com'")
print("USER:", res_user)
if res_user:
    user_id = res_user[0][0]
    res_ev = conn.run(f"SELECT * FROM email_verifications WHERE user_id='{user_id}'")
    print("EV:", res_ev)
    res_audit = conn.run(f"SELECT * FROM audit_logs WHERE user_id='{user_id}'")
    print("AUDIT:", res_audit)

conn.close()
