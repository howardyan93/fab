from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask_wtf.csrf import CsrfProtect
from config import config

db = SQLAlchemy()

login_manager = LoginManager()
login_manager.session_protection = 'strong'
login_manager.login_view = 'auth.login'

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    CsrfProtect(app)

    from .main import main as main_blueprint
    from .resources import main as resource_blueprint
    app.register_blueprint(main_blueprint)
    app.register_blueprint(resource_blueprint)

    from admin import admin, login_manager
    admin.init_app(app)
    login_manager.init_app(app)
    return app
