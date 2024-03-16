from flask import Flask
from flask.helpers import send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="frontend/build", static_url_path="")
CORS(app)


@app.route("/api", methods=["GET"])
def index():
    return {
        "server": "Supervisor Finder Server"
    }

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run()