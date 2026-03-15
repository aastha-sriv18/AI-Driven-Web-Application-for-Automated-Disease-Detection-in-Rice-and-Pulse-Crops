import os
from dotenv import load_dotenv
load_dotenv()
import re
import sqlite3
import logging
from pathlib import Path
from flask import Flask, request, jsonify, session, send_from_directory
from ai_report import generate_disease_report
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import numpy as np
from PIL import Image
import uuid

from flask_cors import CORS
import secrets

# ── App setup (ONE definition only) ──────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, 'test.db')
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, 'static'),
    static_url_path='/static',
)
app.secret_key = os.environ.get('SECRET_KEY')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER   # ✅ set once, used everywhere

CORS(app,
     supports_credentials=True,
     origins=["http://localhost:5173"],
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"])
# ─────────────────────────────────────────────────────────────


try:
    import tensorflow as tf
    from tensorflow.keras.applications.efficientnet import preprocess_input
except ImportError:
    tf = None
    preprocess_input = None

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            profile_picture TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        '''
    )

    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            image_path TEXT,
            predicted_disease TEXT,
            confidence REAL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES user(id)
        )
        '''
    )

    conn.commit()
    conn.close()


init_db()
if not os.path.exists(DB_PATH):
    open(DB_PATH, 'a').close()


# --- Model loading and prediction utilities --------------------------------
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'leaf_disease_efficientnet_final.keras')
MODEL = None

# The class list must match the order used when training the model.
CLASS_NAMES = [
    "Cassava___Bacterial_Blight_CBB",
    "Cassava___Brown_Streak_Disease_CBSD",
    "Cassava___Green_Mottle_CGM",
    "Cassava___Healthy",
    "Cassava___Mosaic_Disease_CMD",
    "Rice___BrownSpot",
    "Rice___Healthy",
    "Rice___Hispa",
    "Rice___LeafBlast",
    "apple___apple_scab",
    "apple___black_rot",
    "apple___cedar_apple_rust",
    "apple___healthy",
    "cherry (including sour)___healthy",
    "cherry (including sour)___powdery_mildew",
    "corn (maize)___cercospora_leaf_spot_gray_leaf_spot",
    "corn (maize)___common_rust",
    "corn (maize)___healthy",
    "corn (maize)___northern_leaf_blight",
    "grape___black_rot",
    "grape___esca_black_measles",
    "grape___healthy",
    "grape___leaf_blight_isariopsis_leaf_spot",
    "orange___haunglongbing_citrus_greening",
    "peach___bacterial_spot",
    "peach___healthy",
    "pepper, bell___bacterial_spot",
    "pepper, bell___healthy",
    "potato___early_blight",
    "potato___healthy",
    "potato___late_blight",
    "squash___powdery_mildew",
    "strawberry___healthy",
    "strawberry___leaf_scorch",
    "tomato___bacterial_spot",
    "tomato___early_blight",
    "tomato___healthy",
    "tomato___late_blight",
    "tomato___leaf_mold",
    "tomato___septoria_leaf_spot",
    "tomato___spider_mites_two-spotted_spider_mite",
    "tomato___target_spot",
    "tomato___tomato_mosaic_virus",
    "tomato___tomato_yellow_leaf_curl_virus",
]


def _load_model():
    global MODEL
    if MODEL is not None:
        return

    if tf is None:
        logging.warning('TensorFlow is not installed. Prediction endpoint will be unavailable.')
        return

    if not os.path.exists(MODEL_PATH):
        logging.warning('Model file not found at %s', MODEL_PATH)
        return

    MODEL = tf.keras.models.load_model(MODEL_PATH)
    logging.info('Loaded model (%s) with %d classes', MODEL_PATH, len(CLASS_NAMES))


def _preprocess_image(image):
    image = image.convert('RGB')
    image = image.resize((224, 224))
    arr = np.array(image)
    arr = np.expand_dims(arr, axis=0)

    # EfficientNet preprocessing handles scaling and normalization.
    if preprocess_input is not None:
        arr = preprocess_input(arr)

    return arr


_load_model()


def _current_user():
    if 'user_id' not in session:
        return None

    conn = get_db_connection()
    row = conn.execute('SELECT id, first_name, last_name, email, profile_picture FROM user WHERE id = ?', (session['user_id'],)).fetchone()
    conn.close()

    if not row:
        return None

    return {
        'id': row['id'],
        'first_name': row['first_name'],
        'last_name': row['last_name'],
        'email': row['email'],
        'profile_picture': row['profile_picture'],
    }


@app.route('/api/signup', methods=['POST', 'OPTIONS'])
def api_signup():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    first = request.form.get('first_name', '').strip()
    last = request.form.get('last_name', '').strip()
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')
    confirm = request.form.get('confirm_password', '')

    if not (first and last and email and password and confirm):
        return jsonify({'message': 'Please fill in all fields'}), 400
    if password != confirm:
        return jsonify({'message': 'Passwords do not match'}), 400

    pic = request.files.get('profile_picture')
    filename = None

    if pic and pic.filename:
        filename = f"{uuid.uuid4().hex}_{secure_filename(pic.filename)}"
        pic.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        conn.execute(
            'INSERT INTO user (first_name, last_name, email, password, profile_picture) VALUES (?, ?, ?, ?, ?)',
            (first, last, email, hashed_password, filename),
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Signup successful'})
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Email already registered'}), 400


@app.route('/api/login', methods=['POST', 'OPTIONS'])
def api_login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM user WHERE email = ?', (email,)).fetchone()
    conn.close()

    if user and check_password_hash(user['password'], password):
        session['user_id'] = user['id']
        session['user_name'] = f"{user['first_name']} {user['last_name']}"
        session['profile_picture'] = user['profile_picture']
        return jsonify({
            'success': True,
            'user': {
                'first_name': user['first_name'],
                'profile_picture': user['profile_picture'],
            },
        })

    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/api/user', methods=['GET'])
def api_user():
    user = _current_user()
    if not user:
        return jsonify({'authenticated': False}), 401
    return jsonify({'authenticated': True, 'user': user})


@app.route('/api/update_profile', methods=['POST', 'OPTIONS'])
def api_update_profile():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    if 'user_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401

    first = request.form.get('first_name', '').strip()
    last = request.form.get('last_name', '').strip()
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    if not (first and last and email):
        return jsonify({'message': 'First name, last name, and email are required'}), 400

    remove_picture = request.form.get('remove_profile_picture') == 'true'

    profile_picture = None
    pic = request.files.get('profile_picture')

    if remove_picture:
        profile_picture = None
    elif pic and pic.filename:
        filename = f"{uuid.uuid4().hex}_{secure_filename(pic.filename)}"
        pic.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        profile_picture = filename

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM user WHERE id = ?', (session['user_id'],)).fetchone()

    if not user:
        conn.close()
        return jsonify({'message': 'User not found'}), 404

    if password:
        password = generate_password_hash(password)
    else:
        password = user['password']

    if remove_picture:
        profile_picture = None
    elif profile_picture is None:
        profile_picture = user['profile_picture']

    conn.execute(
        '''
        UPDATE user
        SET first_name = ?, last_name = ?, email = ?, password = ?, profile_picture = ?
        WHERE id = ?
        ''',
        (first, last, email, password, profile_picture, session['user_id']),
    )
    conn.commit()
    conn.close()

    session['user_name'] = f"{first} {last}"
    session['profile_picture'] = profile_picture

    return jsonify({'success': True})


@app.route('/api/history', methods=['GET'])
def api_history():
    if 'user_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401

    conn = get_db_connection()
    rows = conn.execute(
        '''
        SELECT image_path, predicted_disease, confidence, uploaded_at
        FROM prediction_history
        WHERE user_id = ?
        ORDER BY uploaded_at DESC
        ''',
        (session['user_id'],),
    ).fetchall()
    conn.close()

    return jsonify({
        'history': [
            {
                'image_path': row['image_path'],
                'predicted_disease': format_class_name(row['predicted_disease']),
                'confidence': row['confidence'],
                'uploaded_at': row['uploaded_at'],
            }
            for row in rows
        ]
    })


@app.route('/api/logout', methods=['POST', 'OPTIONS'])
def api_logout():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    session.clear()
    return jsonify({'success': True})


def format_class_name(name: str) -> str:
    # Replace any sequence of underscores with a single space
    # This handles names like "apple___black_rot" cleanly.
    return re.sub(r"_+", " ", name).title()


@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def api_predict():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    if tf is None or MODEL is None:
        return jsonify({'message': 'Prediction model is not loaded'}), 503

    if 'image' not in request.files:
        return jsonify({'message': 'No image uploaded'}), 400

    file = request.files['image']
    if not file.filename:
        return jsonify({'message': 'No image selected'}), 400

    try:
        # Save uploaded image so history can display it later
        filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.stream.seek(0)
        file.save(save_path)
        image_url = f"/static/uploads/{filename}"

        image = Image.open(save_path)
        image_tensor = _preprocess_image(image)

        preds = MODEL.predict(image_tensor)[0]
        main_index = int(np.argmax(preds))
        main_confidence = float(preds[main_index])
        main_prediction = format_class_name(CLASS_NAMES[main_index])

        # Store prediction history if user is logged in
        if 'user_id' in session:
            conn = get_db_connection()
            conn.execute(
                '''
                INSERT INTO prediction_history (user_id, image_path, predicted_disease, confidence)
                VALUES (?, ?, ?, ?)
                ''',
                (session['user_id'], image_url, CLASS_NAMES[main_index], main_confidence),
            )
            conn.commit()
            conn.close()

        top5_idx = np.argsort(preds)[-5:][::-1]
        top5 = []
        for i in top5_idx:
            top5.append(
                {
                    'disease': format_class_name(CLASS_NAMES[i]),
                    'confidence': float(preds[i]),
                }
            )

        return jsonify(
            {
                'main_prediction': main_prediction,
                'main_confidence': main_confidence,
                'top5': top5,
            }
        )
    except Exception as e:
        logging.exception('Prediction failed')
        return jsonify({'message': 'Prediction error', 'error': str(e)}), 500


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)



@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # Let the React app handle routing; if an API path is requested, return 404
    if path.startswith('api'):
        return jsonify({'message': 'Not found'}), 404

    react_build_dir = os.path.join(app.static_folder, 'frontend')
    index_path = os.path.join(react_build_dir, 'index.html')

    if os.path.exists(index_path):
        return send_from_directory(react_build_dir, 'index.html')

    return jsonify({'message': 'Frontend build not found. Run `npm run build` in frontend/`'}), 404


@app.route("/api/generate-report/", methods=["POST"])
def generate_report():

    data = request.json

    disease = data.get("disease")
    confidence = data.get("confidence")
    top5 = data.get("top5", [])

    report = generate_disease_report(disease, confidence, top5)

    return jsonify({
        "report": report
    })

if __name__ == '__main__':
    app.run(debug=True)

