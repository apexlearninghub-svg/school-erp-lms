import os
import pg8000.native
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("DATABASE_URL")
if not url:
    print("NO DB URL")
    exit()

# Parse the URL (format: postgresql+pg8000://user:password@host/dbname)
parts = url.replace("postgresql+pg8000://", "").split("@")
user_pass = parts[0].split(":")
host_db = parts[1].split("/")
user = user_pass[0]
password = user_pass[1]
host = host_db[0]
database = host_db[1]

try:
    conn = pg8000.native.Connection(user=user, password=password, host=host, database=database)
    res = conn.run("SELECT email FROM users WHERE email='fake222@dyleris.com'")
    print("USER IN DB:", res)
    conn.close()
except Exception as e:
    print("ERROR:", e)
