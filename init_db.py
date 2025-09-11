import os
import sys
from dotenv import load_dotenv
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables from .env file
load_dotenv()

from main import app, db

with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("Database tables created.")