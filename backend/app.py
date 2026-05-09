import os
import uuid
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from models import db, User, Song, Playlist, PlaylistSong, Payment
from flask import Flask
app = Flask(__name__)

load_dotenv()
@app.route('/')
def home():
    return jsonify({
        'message': 'Melodique backend is running',
        'health': '/api/health'
    })

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///melodique.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'superjwtsecret')
CORS(app)
jwt = JWTManager(app)
db.init_app(app)

def serialize_user(user):
    return {
        'id': user.id,
        'name': user.name,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'subscription_status': user.subscription_status,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }

def serialize_song(song):
    return {
        'id': song.id,
        'song_name': song.song_name,
        'singer_name': song.singer_name,
        'genre': song.genre,
        'songwriter': song.songwriter,
        'release_date': song.release_date.isoformat(),
        'file_path': song.file_path,
        'uploaded_by': song.uploaded_by,
        'created_at': song.created_at.isoformat() if song.created_at else None,
    }

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current = get_jwt_identity()
            if current['role'] not in roles:
                return jsonify({'message': 'Access denied'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    required = ['name', 'username', 'email', 'password', 'role']
    if any(not data.get(x) for x in required):
        return jsonify({'message': 'All fields are required'}), 400
    if data['role'] not in ['user', 'singer']:
        return jsonify({'message': 'Only user or singer registration allowed'}), 400
    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({'message': 'Username or email already exists'}), 409
    user = User(
        name=data['name'],
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data['role'],
        subscription_status='free'
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Registration successful', 'user': serialize_user(user)}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(username=data.get('username')).first()
    if not user or not check_password_hash(user.password_hash, data.get('password', '')):
        return jsonify({'message': 'Invalid credentials'}), 401
    token = create_access_token(identity={
        'id': user.id,
        'username': user.username,
        'role': user.role
    }, expires_delta=timedelta(hours=8))
    return jsonify({'token': token, 'user': serialize_user(user)})

@app.route('/api/auth/request-password-reset', methods=['POST'])
def request_reset():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get('email')).first()
    if not user:
        return jsonify({'message': 'If email exists, reset token generated'}), 200
    token = str(uuid.uuid4())[:8]
    user.reset_token = token
    db.session.commit()
    return jsonify({'message': 'Reset token generated', 'reset_token': token})

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get('email'), reset_token=data.get('reset_token')).first()
    if not user:
        return jsonify({'message': 'Invalid reset token'}), 400
    user.password_hash = generate_password_hash(data.get('new_password'))
    user.reset_token = None
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'})

@app.route('/api/songs', methods=['GET'])
@jwt_required(optional=True)
def get_songs():
    q = Song.query
    song_name = request.args.get('song_name')
    singer = request.args.get('singer')
    genre = request.args.get('genre')
    if song_name:
        q = q.filter(Song.song_name.ilike(f'%{song_name}%'))
    if singer:
        q = q.filter(Song.singer_name.ilike(f'%{singer}%'))
    if genre:
        q = q.filter(Song.genre.ilike(f'%{genre}%'))
    songs = q.order_by(Song.created_at.desc()).all()
    return jsonify([serialize_song(song) for song in songs])

@app.route('/api/songs/<int:song_id>', methods=['GET'])
@jwt_required(optional=True)
def get_song(song_id):
    song = Song.query.get_or_404(song_id)
    return jsonify(serialize_song(song))

@app.route('/api/songs', methods=['POST'])
@role_required('singer', 'admin')
def create_song():
    current = get_jwt_identity()
    data = request.get_json() or {}
    required = ['song_name', 'singer_name', 'genre', 'songwriter', 'release_date', 'file_path']
    if any(not data.get(x) for x in required):
        return jsonify({'message': 'Missing required fields'}), 400
    song = Song(
        song_name=data['song_name'],
        singer_name=data['singer_name'],
        genre=data['genre'],
        songwriter=data['songwriter'],
        release_date=datetime.strptime(data['release_date'], '%Y-%m-%d').date(),
        file_path=data['file_path'],
        uploaded_by=current['id']
    )
    db.session.add(song)
    db.session.commit()
    return jsonify({'message': 'Song created', 'song': serialize_song(song)}), 201

@app.route('/api/songs/<int:song_id>', methods=['PUT'])
@role_required('singer', 'admin')
def update_song(song_id):
    current = get_jwt_identity()
    song = Song.query.get_or_404(song_id)
    if current['role'] == 'singer' and song.uploaded_by != current['id']:
        return jsonify({'message': 'You can edit only your songs'}), 403
    data = request.get_json() or {}
    for field in ['song_name', 'singer_name', 'genre', 'songwriter', 'file_path']:
        if field in data:
            setattr(song, field, data[field])
    if 'release_date' in data:
        song.release_date = datetime.strptime(data['release_date'], '%Y-%m-%d').date()
    db.session.commit()
    return jsonify({'message': 'Song updated', 'song': serialize_song(song)})

@app.route('/api/songs/<int:song_id>', methods=['DELETE'])
@role_required('singer', 'admin')
def delete_song(song_id):
    current = get_jwt_identity()
    song = Song.query.get_or_404(song_id)
    if current['role'] == 'singer' and song.uploaded_by != current['id']:
        return jsonify({'message': 'You can delete only your songs'}), 403
    db.session.delete(song)
    db.session.commit()
    return jsonify({'message': 'Song deleted'})

@app.route('/api/my-songs', methods=['GET'])
@role_required('singer')
def my_songs():
    current = get_jwt_identity()
    songs = Song.query.filter_by(uploaded_by=current['id']).all()
    return jsonify([serialize_song(song) for song in songs])

@app.route('/api/playlists', methods=['GET'])
@role_required('user')
def get_playlists():
    current = get_jwt_identity()
    playlists = Playlist.query.filter_by(user_id=current['id']).all()
    result = []
    for pl in playlists:
        links = PlaylistSong.query.filter_by(playlist_id=pl.id).all()
        song_ids = [l.song_id for l in links]
        songs = Song.query.filter(Song.id.in_(song_ids)).all() if song_ids else []
        result.append({
            'id': pl.id,
            'name': pl.name,
            'songs': [serialize_song(s) for s in songs]
        })
    return jsonify(result)

@app.route('/api/playlists', methods=['POST'])
@role_required('user')
def create_playlist():
    current = get_jwt_identity()
    data = request.get_json() or {}
    if not data.get('name'):
        return jsonify({'message': 'Playlist name required'}), 400
    playlist = Playlist(name=data['name'], user_id=current['id'])
    db.session.add(playlist)
    db.session.commit()
    for song_id in data.get('song_ids', []):
        db.session.add(PlaylistSong(playlist_id=playlist.id, song_id=song_id))
    db.session.commit()
    return jsonify({'message': 'Playlist created'})

@app.route('/api/payments/subscribe', methods=['POST'])
@role_required('user')
def subscribe():
    current = get_jwt_identity()
    data = request.get_json() or {}
    method = data.get('payment_method')
    if method not in ['Card', 'UPI']:
        return jsonify({'message': 'Payment method must be Card or UPI'}), 400
    should_fail = data.get('simulate_failure', False)
    payment = Payment(
        transaction_id=str(uuid.uuid4()),
        user_id=current['id'],
        amount=float(data.get('amount', 99.0)),
        payment_method=method,
        status='failed' if should_fail else 'success'
    )
    db.session.add(payment)
    user = User.query.get(current['id'])
    if not should_fail:
        user.subscription_status = 'premium'
    db.session.commit()
    status_code = 200 if not should_fail else 400
    return jsonify({'message': 'Payment successful' if not should_fail else 'Payment failed', 'payment_status': payment.status}), status_code

@app.route('/api/admin/users', methods=['GET'])
@role_required('admin')
def admin_users():
    users = User.query.filter_by(role='user').all()
    return jsonify([serialize_user(u) for u in users])

@app.route('/api/admin/users', methods=['POST'])
@role_required('admin')
def admin_create_user():
    data = request.get_json() or {}
    user = User(
        name=data.get('name'),
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role='user',
        subscription_status=data.get('subscription_status', 'free')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created', 'user': serialize_user(user)}), 201

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@role_required('admin')
def admin_update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    for field in ['name', 'username', 'email', 'subscription_status']:
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify({'message': 'User updated', 'user': serialize_user(user)})

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@role_required('admin')
def admin_delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/api/admin/singers', methods=['GET'])
@role_required('admin')
def admin_singers():
    singers = User.query.filter(User.role == 'singer').all()
    return jsonify([serialize_user(s) for s in singers])

@app.route('/api/admin/singers', methods=['POST'])
@role_required('admin')
def admin_create_singer():
    data = request.get_json() or {}
    singer = User(
        name=data.get('name'),
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role='singer'
    )
    db.session.add(singer)
    db.session.commit()
    return jsonify({'message': 'Singer created', 'singer': serialize_user(singer)}), 201

@app.route('/api/admin/singers/<int:singer_id>', methods=['PUT'])
@role_required('admin')
def admin_update_singer(singer_id):
    singer = User.query.get_or_404(singer_id)
    data = request.get_json() or {}
    for field in ['name', 'username', 'email']:
        if field in data:
            setattr(singer, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Singer updated', 'singer': serialize_user(singer)})

@app.route('/api/admin/singers/<int:singer_id>', methods=['DELETE'])
@role_required('admin')
def admin_delete_singer(singer_id):
    singer = User.query.get_or_404(singer_id)
    db.session.delete(singer)
    db.session.commit()
    return jsonify({'message': 'Singer deleted'})

@app.route('/api/admin/reports', methods=['GET'])
@role_required('admin')
def admin_reports():
    user_count = User.query.filter_by(role='user').count()
    singer_count = User.query.filter_by(role='singer').count()
    song_count = Song.query.count()
    payments = Payment.query.all()
    revenue = sum(p.amount for p in payments if p.status == 'success')
    return jsonify({
        'users': user_count,
        'singers': singer_count,
        'songs': song_count,
        'payments_count': len(payments),
        'successful_revenue': revenue,
        'payment_records': [{
            'transaction_id': p.transaction_id,
            'user_id': p.user_id,
            'amount': p.amount,
            'method': p.payment_method,
            'status': p.status,
            'date': p.date.isoformat()
        } for p in payments]
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)