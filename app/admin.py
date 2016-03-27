from flask import redirect, url_for, request
from flask_admin import Admin
from wtforms import form, fields, validators
from flask.ext.login import LoginManager, current_user, login_user, logout_user
from flask_admin.contrib.sqla import ModelView
from werkzeug.security import generate_password_hash, check_password_hash
from flask_admin.contrib import sqla
from models import User, Post, Comment, tag, Category
import flask_admin as admin
import flask_login as login
from flask_admin import helpers, expose
from flask.ext.login import UserMixin
from . import db

class UserForAdmin(User, UserMixin):
    pass

# Define login and registration forms (for flask-login)
class LoginForm(form.Form):
    email = fields.StringField(validators=[validators.required(), validators.Email()])
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self):
        user = self.get_user()
        if user is None:
            raise validators.ValidationError('Invalid user')
        # we're comparing the plaintext pw with the the hash from the db
        if not check_password_hash(user.pwd_hash, self.password.data):
        # to compare plain text passwords use
            raise validators.ValidationError('Invalid password')
        return True

    def get_user(self):
        return UserForAdmin.query.filter_by(email=self.email.data).first()


class RegistrationForm(form.Form):
    email = fields.StringField(validators=[validators.required()])
    username = fields.StringField(validators=[validators.required()])
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self):
        if UserForAdmin.query.filter_by(email=self.email.data).count() > 0:
            raise validators.ValidationError('Duplicate username')
        return True


class MyModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated

# Create customized index view class that handles login & registration
class MyAdminIndexView(admin.AdminIndexView):
    @expose('/')
    def index(self):
        if not login.current_user.is_authenticated:
            return redirect(url_for('.login_view'))
        return super(MyAdminIndexView, self).index()

    @expose('/login/', methods=('GET', 'POST'))
    def login_view(self):
        # handle user login
        form = LoginForm(request.form)
        if helpers.validate_form_on_submit(form):
            if form.validate_login():
                user = form.get_user()
                login.login_user(user)

        if login.current_user.is_authenticated:
            return redirect(url_for('.index'))
        #link = '<p>Don\'t have an account? <a href="' + url_for('.register_view') + '">Click here to register.</a></p>'
        self._template_args['form'] = form
        #self._template_args['link'] = link
        return super(MyAdminIndexView, self).index()

    #@expose('/register/', methods=('GET', 'POST'))
    #def register_view(self):
    #    form = RegistrationForm(request.form)
    #    if helpers.validate_form_on_submit(form):
    #        user = User()

    #        form.populate_obj(user)
    #        # we hash the users password to avoid saving it as plaintext in the db,
    #        # remove to use plain text:
    #        user.password = form.password.data

    #        db.session.add(user)
    #        db.session.commit()

    #        login.login_user(user)
    #        return redirect(url_for('.index'))
    #    link = '<p>Already have an account? <a href="' + url_for('.login_view') + '">Click here to log in.</a></p>'
    #    self._template_args['form'] = form
    #    self._template_args['link'] = link
    #    return super(MyAdminIndexView, self).index()

    @expose('/logout/')
    def logout_view(self):
        login.logout_user()
        return redirect(url_for('.index'))

#admin = Admin(name='blogAdmin', template_mode='bootstrap3')
admin = Admin(name='blogAdmin', index_view=MyAdminIndexView(), base_template='my_master.html')
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return db.session.query(UserForAdmin).get(user_id)

admin.add_view(MyModelView(UserForAdmin, db.session))
admin.add_view(MyModelView(Post, db.session))
admin.add_view(MyModelView(Category, db.session))
admin.add_view(MyModelView(Comment, db.session))
admin.add_view(MyModelView(tag, db.session))
