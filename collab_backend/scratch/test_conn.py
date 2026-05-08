import psycopg2

password = "9868998668@g"
project_id = "chgjkequzstvuberpymk"

print(f"Testing project ID {project_id} via pooler...")
try:
    conn = psycopg2.connect(
        host="aws-0-ap-south-1.pooler.supabase.com",
        port=6543,
        user=f"postgres.{project_id}",
        password=password,
        dbname="postgres",
        sslmode="require",
        connect_timeout=5
    )
    print("SUCCESS!")
    conn.close()
except Exception as e:
    print(f"FAILED: {e}")
