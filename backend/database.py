import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """
    Returns a new PostgreSQL connection.
    Called at the start of each request.
    psycopg2.extras.RealDictCursor makes rows behave like dicts,
    same as mysql-connector's dictionary=True.
    """
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", "5432"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dbname=os.getenv("DB_NAME"),
        cursor_factory=psycopg2.extras.RealDictCursor
    )
