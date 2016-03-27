import os
from app import create_app, db
from app.models import User, Role, Post, Comment, tag, Category
from flask.ext.script import Manager, Shell, Command
from flask.ext.migrate import Migrate, MigrateCommand

#app = create_app(os.getenv('FLASK_CONFIG') or 'default')
app = create_app('production')
manager = Manager(app)
migrate = Migrate(app, db)

def make_shell_context():
    return dict(app=app, db=db, User=User, Role=Role, Post=Post, Comment=Comment, tag=tag)

@manager.command
def register():
    import getpass
    print "-"*64 + "\n" + "** please input your email" + "\n" + "-"*64
    email = raw_input().decode("utf-8")
    print "-"*64 + "\n" + "** please input your name" + "\n" + "-"*64
    name = raw_input().decode("utf-8")
    while True:
        print "please input your password" + "\n" + "*"*64
        password = getpass.getpass().decode("utf-8")
        print "please input your password again" + "\n" + "*"*64
        password2 = getpass.getpass().decode("utf-8")
        if password == password2:
            break
    print "your email is %s, your name is %s" % (email, name)
    print "Reagister? [yes/no]"
    selection = raw_input()
    if selection == 'no':
        exit()
    else:
        query  = User.query.filter_by(email=email).first()
        if query:
            print "User already exists!!"
        else:
            user = User(email=email, username=name, password=password)
            db.session.add(user)
            db.session.commit()
            print "Register success!!"
    exit()

@manager.command
def blog_init():
    db.create_all()
    db.session.add(Category(type='default'))
    db.session.commit()

manager.add_command("shell", Shell(make_context=make_shell_context))
manager.add_command("db", MigrateCommand)

if __name__ == "__main__":
    manager.run()