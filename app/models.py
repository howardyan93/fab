from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from markdown import markdown
import bleach
from flask import current_app


class Permission:
    FOLLOW            = 0x01
    COMMENT           = 0x02
    WRITE_ARTICLES    = 0x04
    MODERATE_COMMENTS = 0x08
    ADMINISTER        = 0x80

class Role(db.Model):
    __tablename__ = 'roles'
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)

    def __repr__(self):
        return "<Role %r>" % self.name

class User(db.Model):
    __tablename__ = "users"
    id       = db.Column(db.Integer, primary_key=True)
    email    = db.Column(db.String(64), unique=True)
    username = db.Column(db.String(64))
    pwd_hash = db.Column(db.String(128))
    comments = db.relationship('Comment', backref='author', lazy='dynamic')

    def __repr__(self):
        return "<User %r>" % self.username

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.pwd_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.pwd_hash, password)

    def generate_confirmation_token(self, expiration=3600):
        s = Serializer(current_app.config['SECRET_KEY'], expiration)
        return s.dumps({'id': self.id})

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except:
            return None
        return User.query.get(data['id'])

class Category(db.Model):
    __tablename__ = "categories"
    id    = db.Column(db.Integer, primary_key=True)
    type  = db.Column(db.String(64), unique=True)
    posts = db.relationship('Post', backref='category', lazy='dynamic')

    def __repr__(self):
        return "<Category %r>" % self.type

    def to_dict(self):
        return {"id":self.id, "type": self.type}


class tag(db.Model):
    __tablename__ = "tags"
    id       = db.Column(db.Integer, primary_key=True)
    tag_type = db.Column(db.String(64), unique=True, nullable=False)

    def __repr__(self):
        return "<Tag %r>" % self.tag_type

    def to_dict(self):
        return {"tag_type": self.tag_type}

tag_relation = db.Table(
    'tag_relations',
    db.Column('posts_id', db.Integer, db.ForeignKey('posts.id')),
    db.Column('tags_id',  db.Integer, db.ForeignKey('tags.id'))
)

class Post(db.Model):
    __tablename__ = 'posts'
    id               = db.Column(db.Integer, primary_key=True)
    title            = db.Column(db.String(128), nullable=False)
    sub              = db.Column(db.String(128), nullable=False)
    text             = db.Column(db.Text, nullable=False)
    html             = db.Column(db.Text)
    pubDatetime      = db.Column(db.DateTime, default=datetime.utcnow)
    modifiedDatetime = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    viewedCount      = db.Column(db.Integer,  default=0)
    category_id      = db.Column(db.Integer,  db.ForeignKey('categories.id'))

    comments         = db.relationship('Comment', backref='post', lazy='dynamic')

    def __repr__(self):
        return "<Post %r>" % self.title

    @staticmethod
    def on_changed_body(target, value, oldvalue, initiator):
        allowed_tags = ['a', 'abbr', 'acronym', 'b', 'blockquote', 'code',
                        'em', 'i', 'li', 'ol', 'pre', 'strong', 'ul',
                        'h1', 'h2', 'h3', 'p']
        target.html = bleach.linkify(bleach.clean(
            markdown(value, output_format='html'),
            tags=allowed_tags, strip=True))

    def to_dict(self):
        result = {"id": self.id,
                  "title": self.title,
                  "sub": self.sub,
                  "text": self.text,
                  "html": self.html,
                  "pubDatetime": self.pubDatetime.ctime(),
                  "modifiedDatetime": self.modifiedDatetime.ctime(),
                  "viewedCount": self.viewedCount,
                  "commentsCount": self.comments.count(),
                  "category": self.category_id,
                  "tags": [tag.to_dict() for tag in self.tags.all()]
                  }
        return result

    tags = db.relationship('tag',
                           secondary=tag_relation,
                           backref=db.backref('posts', lazy='dynamic'),
                           lazy='dynamic'
                           )

db.event.listen(Post.text, 'set', Post.on_changed_body)

class Comment(db.Model):
    __tablename__ = "comment"
    id       = db.Column(db.Integer, primary_key=True)
    body     = db.Column(db.Text)
    timestamp= db.Column(db.DateTime, index=True, default=datetime.utcnow)
    disabled = db.Column(db.Boolean, default=False)
    author_id= db.Column(db.Integer, db.ForeignKey('users.id'))
    post_id  = db.Column(db.Integer, db.ForeignKey('posts.id'))

    def __repr__(self):
        return "<Comment %r>" % self.body

    def to_dict(self):
        return {"id"       : self.id,
                "body"     : self.body,
                "timestamp": self.timestamp.ctime(),
                "disabled" : self.disabled,
                "post_id"  : self.post_id,
                "author"   : self.author.username
                }




