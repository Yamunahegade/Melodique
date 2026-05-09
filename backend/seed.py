from datetime import date
from werkzeug.security import generate_password_hash
from app import app
from models import db, User, Song, Payment

with app.app_context():
    db.drop_all()
    db.create_all()

    admin = User(name='System Admin', username='admin', email='admin@melodique.com', password_hash=generate_password_hash('Admin@123'), role='admin', subscription_status='premium')
    singer = User(name='Arijit Demo', username='arijit', email='arijit@melodique.com', password_hash=generate_password_hash('Singer@123'), role='singer')
    user = User(name='Listener Demo', username='listener1', email='listener1@melodique.com', password_hash=generate_password_hash('User@123'), role='user', subscription_status='free')
    db.session.add_all([admin, singer, user])
    db.session.commit()

    songs = [
        Song(song_name='Ocean Lights', singer_name='Arijit Demo', genre='Pop', songwriter='Kiran Dev', release_date=date(2024, 5, 1), file_path='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', uploaded_by=singer.id),
        Song(song_name='Midnight Train', singer_name='Arijit Demo', genre='Indie', songwriter='Sara J', release_date=date(2023, 11, 11), file_path='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', uploaded_by=singer.id),
        Song(song_name='Sunrise Echo', singer_name='Arijit Demo', genre='Acoustic', songwriter='Naveen Rao', release_date=date(2025, 1, 21), file_path='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', uploaded_by=singer.id)
    ]
    db.session.add_all(songs)
    db.session.add(Payment(transaction_id='TXN-DEMO-001', user_id=user.id, amount=99.0, payment_method='UPI', status='success'))
    user.subscription_status = 'premium'
    db.session.commit()
    print('Database seeded successfully')