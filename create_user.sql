create user admin@localhost identified by '111111';
create database myblog default character set utf8;
grant all on myblog.* to admin@localhost; 
