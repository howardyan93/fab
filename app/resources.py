from flask import Blueprint, make_response, request, current_app
from flask.ext.httpauth import HTTPBasicAuth
from .models import Post, Comment, User, tag, Category
from .forms import PostForm, CommentForm, UserForm, LoginForm, CategoryForm, TagForm
from . import db
import json
from datetime import datetime, timedelta
import calendar

main = Blueprint('resource', __name__)
auth = HTTPBasicAuth()



@auth.verify_password
def verify_password(email, password):
    user = User.verify_auth_token(password)
    if user:
        m = user.email == email
        return m
    return False

@main.route('/PostList/Page/')
@main.route('/PostList/Page/<int:page_number>')
def post_list_func(page_number=1):
    query = Post.query.order_by(Post.pubDatetime.desc())
    pagination = query.paginate(page_number,
                                  per_page=current_app.config['FLASKY_POSTS_PER_PAGE'],
                                  error_out=False)
    results = {'pageCount': pagination.pages,
               'items': [i.to_dict() for i in pagination.items]
               }
    return make_response(json.dumps(results))

@main.route("/Post/<int:post_id>")
def index_func(post_id):
    result = Post.query.get(post_id)
    if result:
        result.viewedCount += 1
        db.session.commit()
        return make_response(json.dumps(result.to_dict()))
    return '{"status": "Post is not exists"}', 422

@main.route("/TagList")
def get_tag_list_func():
    result = [i.to_dict() for i in tag.query.all()]
    return make_response(json.dumps(result))

@main.route("/TagList", methods=['POST'])
def add_tag_to_list_func():
    form = TagForm()
    m = form.validate()
    if not m:
        return json.dumps({"status": form.errors})
    db.session.add(tag(tag_type=form.tag_type.data))
    db.session.commit()
    return '{"status": "Comments success"}'

@main.route("/CategoryList/")
def category_list_func():
    result = [i.to_dict() for i in Category.query.all()]
    return make_response(json.dumps(result))

@main.route("/Category/<type>/Page/<int:page_number>")
def category_query_func(type, page_number=1):
    category_query = Category.query.filter_by(type=type).first()
    post_query = category_query.posts.order_by(Post.pubDatetime.desc())
    if category_query:
        pagination = post_query.paginate(page_number,
                                         per_page=current_app.config['FLASKY_POSTS_PER_PAGE'],
                                         error_out=False)
        result = {'pageCount': pagination.pages,
                  'items': [i.to_dict() for i in pagination.items]
                 }
        return make_response(json.dumps(result))
    else:
        return ''

@main.route("/Tag/<tag_type>/Page/<int:page_number>")
def tag_query_func(tag_type, page_number=1):
    tag_query = tag.query.filter_by(tag_type=tag_type).first()
    post_query = tag_query.posts.order_by(Post.pubDatetime.desc())
    if tag_query:
        pagination = post_query.paginate(page_number,
                                         per_page=current_app.config['FLASKY_POSTS_PER_PAGE'],
                                         error_out=False)
        result = {'pageCount': pagination.pages,
                  'items': [i.to_dict() for i in pagination.items]
                 }
        return make_response(json.dumps(result))
    else:
        return ''

@main.route("/Archive/<int:year>/<int:month>/Page/<int:page_number>")
def archive_query_func(year, month, page_number=1):
    start_date = datetime(year, month, 1)
    _, days_in_month = calendar.monthrange(start_date.year, start_date.month)
    end_date = start_date + timedelta(days=days_in_month)
    post_query = Post.query.filter(Post.pubDatetime.between(start_date, end_date)).order_by(Post.pubDatetime.desc())
    if post_query:
        pagination = post_query.paginate(page_number,
                                         per_page=current_app.config['FLASKY_POSTS_PER_PAGE'],
                                         error_out=False)
        result = {'pageCount': pagination.pages,
                  'items': [i.to_dict() for i in pagination.items]
                 }
        return make_response(json.dumps(result))
    else:
        return ''

@main.route("/Comment/")
def comment_query_func():
    result = [i.to_dict() for i in Comment.query.order_by(Comment.timestamp.desc()).limit(6)]
    return make_response(json.dumps(result))

@main.route("/ArchiveList/")
def archive_list_func():
    datetimeLlist = db.session.query(Post.pubDatetime).all()
    if datetimeLlist:
        dateSet = set((i[0].year, i[0].month) for i in datetimeLlist)
        dateList = [{"year": i[0], "month": i[1]} for i in dateSet]
        return make_response(json.dumps(list(dateList)))
    else:
        return ''

@main.route("/Post", methods=['POST'])
@main.route("/Post/<int:post_id>", methods=['POST'])
@auth.login_required
def new_post_func(post_id=None):
    form = PostForm()
    m = form.validate()
    if not m:
        return json.dumps({"status": form.errors}), 422
    category = Category.query.filter_by(id=form.category_id.data).first()
    if not category:
        return '{"status": "no such category"}', 422
    tags = request.json['tags']
    if post_id:
        #post = Post.query.filter_by(id=post_id).first()
        post = Post.query.get(post_id)
        if not post:
            return '{"status": "Post Id is wrong for update"}', 422
        for i in post.tags:
            post.tags.remove(i)
        post.title = form.title.data
        post.sub = form.text.data[0:63]
        post.text = form.text.data
    else:
        post = Post(
            title=form.title.data,
            sub=form.text.data[0:63],
            text=form.text.data,
        )
    for i in tags:
        tag_query_result = tag.query.filter_by(tag_type=unicode(i)).first()
        if tag_query_result:
            post.tags.append(tag_query_result)
    category.posts.append(post)
    db.session.commit()
    return '{"status": "Post success"}'



@main.route("/Post/<int:post_id>/comment", methods=['POST'])
@auth.login_required
def comments_get_func(post_id):
    email = request.authorization.get('username')
    user = User.query.filter_by(email=email).first()
    form = CommentForm()
    m = form.validate_on_submit()
    if not m:
        return form.errors, 422
    post = Post.query.filter_by(id=post_id).first()
    post.comments.append(Comment(body=form.body.data, author=user))
    db.session.commit()
    return '{"status": "Comments success"}'

@main.route("/Post/<int:post_id>/comment", methods=['GET'])
def comment_post_func(post_id):
    post = Post.query.filter_by(id=post_id).first()
    result = [i.to_dict() for i in post.comments]
    result.reverse()
    return json.dumps(result)

@main.route("/Login", methods=['GET', 'POST'])
def login_func():
    if request.method == "POST":
        form = LoginForm()
        m = form.validate_on_submit()
        if not m:
            return form.errors, 422
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            if user.verify_password(form.pwd.data):
                    return json.dumps({"authenticated": True,
                                       "token": user.generate_confirmation_token()
                                       })
            return json.dumps({"authenticated": False})

@main.route("/Search/Page/<int:page_number>", methods=['GET', 'POST'])
def search_func(page_number):
    search_string = request.json.get('search_string')
    if search_string is None:
        return '{"status": "can not search null string"}'
    post_query = Post.query.filter(Post.title.like(u'%{0}%'.format(search_string))).order_by(Post.pubDatetime.desc())
    if post_query:
        pagination = post_query.paginate(page_number,
                                         per_page=current_app.config['FLASKY_POSTS_PER_PAGE'],
                                         error_out=False)
        result = {'pageCount': pagination.pages,
                  'items': [i.to_dict() for i in pagination.items]
                 }
        return make_response(json.dumps(result))
    else:
        return ''

@main.route("/Validate_token")
@auth.login_required
def validate_token():
    return ''
