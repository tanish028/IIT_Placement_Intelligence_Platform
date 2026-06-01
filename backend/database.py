import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """
    Returns a new MySQL connection.
    Called at the start of each request — no persistent pool needed at this scale.
    """
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "iit_placements_db")
    )
