'use strict';

/* Services */

var angularBlogServices = angular.module('angularBlogServices', ['ngResource']);

angularBlogServices.factory('BlogPost', ['$resource',
    function($resource) {
        return $resource("./Post/:id", {}, {
            get:    {method: 'GET',    cache: true,  isArray: false},
            get_no_cache: {method: 'GET',    cache: false,  isArray: false},
            save:   {method: 'POST',   cache: false, isArray: false},
            update: {method: 'PUT',    cache: false, isArray: false},
            delete: {method: 'DELETE', cache: false, isArray: false}
        });
    }]);

angularBlogServices.factory('BlogList', ['$resource',
    function($resource) {
        return $resource("./PostList/Page/:page_no", {}, {
            get:    {method: 'GET',    cache: false, isArray: false}
        });
    }]);

angularBlogServices.factory('Tag', ['$resource',
    function($resource) {
        return $resource("./Tag/:tag_type/Page/:page_no", {}, {
            get:    {method: 'GET',    cache: true, isArray: false}
        });
    }]);

angularBlogServices.factory('Login', ['$resource',
    function($resource) {
        return $resource("./Login", {}, {
            login:  {method: 'POST',   cache: false, isArray: false}
        });
    }]);

angularBlogServices.factory('Comments', ['$resource',
    function($resource) {
        return $resource("./Post/:id/comment/", {id: '@id'}, {
            get:    {method: 'GET',    cache: false, isArray: true },
            save:   {method: 'POST',   cache: false, isArray: false}
        });
    }]);

angularBlogServices.factory('RecentComment', ['$resource',
    function($resource) {
        return $resource("./Comment/", {}, {
            get:    {method: 'GET',    cache: true, isArray: true }
        });
    }]);

angularBlogServices.factory('ArchiveList', ['$resource',
    function($resource) {
        return $resource("./ArchiveList/", {}, {
            get:    {method: 'GET',    cache: true, isArray: true }
        });
    }]);

angularBlogServices.factory('CategoryList', ['$resource',
    function($resource) {
        return $resource("./CategoryList/", {}, {
            get:    {method: 'GET',    cache: true, isArray: true }
        });
    }]);

angularBlogServices.factory('Category', ['$resource',
    function($resource) {
        return $resource("./Category/:type/Page/:page_no", {}, {
            get:    {method: 'GET',    cache: true, isArray: false}
        });
    }]);

angularBlogServices.factory('Archive', ['$resource',
    function($resource) {
        return $resource("./Archive/:year/:month/Page/:page_no", {}, {
            get:    {method: 'GET',    cache: true, isArray: false}
        });
    }]);

angularBlogServices.factory('TagList', ['$resource',
    function($resource) {
        return $resource("./TagList", {}, {
            get:          {method: 'GET',    cache: true,  isArray: true},
            get_no_cache: {method: 'GET',    cache: false, isArray: true},
            save:         {method: 'POST',   cache: false, isArray: false},
        });
    }]);

angularBlogServices.factory('Search', ['$resource',
    function($resource) {
        return $resource("./Search/Page/:page_no", {page_no: '@page_no'}, {
            post:   {method: 'POST',   cache: false, isArray: false}
        });
    }]);