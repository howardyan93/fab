# fab
基于Flask， Angularjs和BootStrap的个人小博客。单页面应用

一开始使用wordpress，但是租用的VPS实在太挫，访问页面要卡半天，正好在学习《FLASK WEB开发》这本书和Angularjs的东西，于是就打算自己撸一个个人博客。

因为现在github上基于Flask的博客有不少了，如果跟着搞也没有什么新意，所以决定搞一个基于restful风格的，单页面的应用。

后台代码的结构基本上是从Flasky上改的，我觉得这个结构是个很好的实践。同样Angularjs也一样，能分的很清楚，虽然后面我改得很烂。。

一开始想直接用Flask-restful的扩展，但是想挂蓝图上而不是APP上遇到困难，于是放弃了，使用了土办法在model里添加to_dict函数。

因为是单页面设计，CSRF保护按照wtfrom的文档，直接放住页面的meta里了。

Admin就是参考了Flask-Admin的例子，去掉了注册项。目前是个人用，没添加多户用的权限管理，所以这里没加。将来慢慢弄。

网站例子里考虑实际情况用了多说。Angularjs里面用多说的js插件感觉有点坑，这里参考了disqus的例子。

# 参考:

[Flasky](https://github.com/miguelgrinberg/flasky.git)

[NodeMeanBlog](https://github.com/KenWilliamson/NodeMeanBlog_for_LearningAngularJS.git)

[Sample Web](http://www.digiotaku.com)

# 如何使用

1.修改config.py里的SECRET_KEY，改成随机的组合

2.使用create_user.sql创建数据库。然后运行命令：

    python manager blog_init

初始化数据库

3.运行命令

    python manage.py register

添加一个超级用户，输入邮箱，用户名，密码

4.差不多就可以跑了。由/admin进入管理页面。



