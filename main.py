import os
import sys
from dotenv import load_dotenv
import socket
from urllib.parse import urlparse, urlunparse
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Load environment variables from .env file
load_dotenv()

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.chat_real import chat_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# 启用CORS支持
CORS(app)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')

# uncomment if you need to use database
# Use DATABASE_URL from environment variables and force IPv4
database_url = os.environ.get('DATABASE_URL')
if database_url:
    try:
        parsed_url = urlparse(database_url)
        if parsed_url.hostname:
            # Force IPv4 resolution
            ipv4_address = socket.gethostbyname(parsed_url.hostname)
            # Reconstruct the netloc with the IPv4 address
            new_netloc = parsed_url.netloc.replace(parsed_url.hostname, ipv4_address)
            # Rebuild the URL
            database_url = urlunparse(parsed_url._replace(netloc=new_netloc))
    except (socket.gaierror, TypeError):
        # Fallback to the original URL if resolution fails
        pass

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
