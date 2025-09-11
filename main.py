import os
import sys
from dotenv import load_dotenv
import socket
from urllib.parse import urlparse, urlunparse

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Load environment variables from .env file
load_dotenv()

# Force IPv4 connections - MUST be done before any network operations
original_getaddrinfo = socket.getaddrinfo

def getaddrinfo_ipv4_only(host, port, family=0, type=0, proto=0, flags=0):
    """Force IPv4-only connections for Vercel deployment compatibility."""
    res = original_getaddrinfo(host, port, socket.AF_UNSPEC, type, proto, flags)
    ipv4_res = [r for r in res if r[0] == socket.AF_INET]
    if not ipv4_res:
        raise socket.gaierror(8, f"getaddrinfo failed for {host}: No IPv4 address found")
    return ipv4_res

socket.getaddrinfo = getaddrinfo_ipv4_only

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.chat_real import chat_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Use SECRET_KEY from environment variables with fallback
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    # Use a more secure fallback key for development
    SECRET_KEY = 'dev-key-' + os.urandom(24).hex()
    
app.config['SECRET_KEY'] = SECRET_KEY

# 启用CORS支持
CORS(app)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')

# uncomment if you need to use database
# Use DATABASE_URL from environment variables
database_url = os.environ.get('DATABASE_URL')
if database_url:
    # SQLAlchemy requires 'postgresql' as the scheme, not 'postgres'
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404
