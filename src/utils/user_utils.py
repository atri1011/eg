from src.models.user import db, User

def ensure_user_exists(user_id: int = 1) -> User:
    """确保指定用户存在，如果不存在则创建"""
    user = User.query.filter_by(id=user_id).first()
    if not user:
        user = User(
            id=user_id, 
            username=f'user_{user_id}', 
            email=f'user{user_id}@example.com'
        )
        db.session.add(user)
        db.session.commit()
        print(f"[INFO] Created default user with ID: {user_id}")
    return user