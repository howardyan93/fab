from flask.ext.wtf import Form
from wtforms import StringField, IntegerField
from wtforms.validators import DataRequired, Email
from wtforms_alchemy import model_form_factory, ModelFormField
from models import Post, Comment, User, Category, tag
from . import db
from wtforms_components import Email

BaseModelForm = model_form_factory(Form)

class ModelForm(BaseModelForm):
    @classmethod
    def get_session(self):
        return db.session

class CategoryForm(ModelForm):
    class Meta:
        model = Category

class TagForm(ModelForm):
    class Meta:
        model = tag

class PostForm(Form):
    title = StringField(validators=[DataRequired()])
    text = StringField(validators=[DataRequired()])
    category_id = IntegerField(validators=[DataRequired()])

class CommentForm(ModelForm):
    class Meta:
        model = Comment

class UserForm(ModelForm):
    class Meta:
        model = User

#class LoginForm(ModelForm):
#    class Meta:
#        model = User
#        unique_validator = None
class LoginForm(Form):
    email = StringField(validators=[DataRequired(), Email()])
    pwd = StringField(validators=[DataRequired()])


