import os
from dotenv import load_dotenv

load_dotenv()

print(f"SUPABASE_JWT_SECRET exists: {bool(os.environ.get('SUPABASE_JWT_SECRET'))}")
print(f"DB_PASSWORD exists: {bool(os.environ.get('DB_PASSWORD'))}")
