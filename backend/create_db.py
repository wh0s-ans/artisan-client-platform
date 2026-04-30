import psycopg

conn = psycopg.connect("postgresql://postgres:whosans@localhost:5432/postgres", autocommit=True)
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname='artisan_platform'")
exists = cur.fetchone()
if exists:
    print("Database 'artisan_platform' already exists")
else:
    cur.execute("CREATE DATABASE artisan_platform")
    print("Database 'artisan_platform' created!")
conn.close()
