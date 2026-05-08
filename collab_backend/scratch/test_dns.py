import socket

host = "db.chgjkequzstvuberpymk.supabase.co"
try:
    ip = socket.gethostbyname(host)
    print(f"Host {host} resolved to {ip}")
except Exception as e:
    print(f"Failed to resolve {host}: {e}")
