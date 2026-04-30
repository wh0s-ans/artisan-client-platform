import psycopg
try:
    conn = psycopg.connect("host=localhost port=5432 user=postgres password=whosans dbname=postgres")
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname='artisan_platform'")
    if not cur.fetchone():
        cur.execute("CREATE DATABASE artisan_platform")
        print("Database 'artisan_platform' created!")
    else:
        print("Database 'artisan_platform' already exists!")
    conn.close()
    
    conn2 = psycopg.connect("host=localhost port=5432 user=postgres password=whosans dbname=artisan_platform")
    print("SUCCESS: Connected to artisan_platform!")
    conn2.close()
except Exception as e:
    print(f"FAILED: {e}")
