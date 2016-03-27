'use strict';

/* App Module */

var angularBlogApp = angular.module('angularBlogApp', [
    'ngRoute',
    'ngSanitize',
    'angularBlogControllers',
    'angularBlogServices',
    'angularBlogBusinessServices',
    'angularBlogDirectives'
],
    function($httpProvider) {
        var csrftoken = $('meta[name=csrf-token]').attr('content');
        $httpProvider.defaults.headers.post['X-CSRFToken'] = csrftoken;
    }
);


angularBlogApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider.
                when('/', {
                    redirectTo: '/blogPage'
                }).when('/blogPage', {
                    redirectTo: '/blogPage1'
                }).when('/blogPage:page_no', {
                    templateUrl: 'static/partials/main.html',
                    controller: 'BlogCtrl'
                }).when('/Search/Page:page_no', {
                    templateUrl: 'static/partials/main.html',
                    controller: 'SearchCtrl'
                }).when('/Tag', {
                    redirectTo: '/blogPage'
                }).when('/Tag/:tag_type', {
                    redirectTo: '/Tag/:tag_type/Page1'
                }).when('/Tag/:tag_type/Page:page_no', {
                    templateUrl: 'static/partials/main.html',
                    controller: 'TagCtrl'
                }).when('/Archive', {
                    redirectTo: '/blogPage'
                }).when('/Archive/:year', {
                    redirectTo: '/Archive/:year/1/Page1'
                }).when('/Archive/:year/:month', {
                    redirectTo: '/Archive/:year/:month/Page1'
                }).when('/Archive/:year/:month/Page:page_no', {
                    templateUrl: 'static/partials/main.html',
                    controller: 'ArchiveCtrl'
                 }).when('/Category', {
                    redirectTo: '/blogPage'
                }).when('/Category/:type', {
                    redirectTo: '/Category/:type/Page1'
                }).when('/Category/:type/Page:page_no', {
                    templateUrl: 'static/partials/main.html',
                    controller: 'CategoryCtrl'
                }).when('/blogPost:id', {
                    templateUrl: 'static/partials/blogPost.html',
                    controller: 'BlogViewCtrl'
                }).when('/EditPost:id', {
                    templateUrl: 'static/partials/newPost.html',
                    controller: 'EditPostCtrl'
                }).when('/newBlogPost', {
                    templateUrl: 'static/partials/newPost.html',
                    controller: 'NewBlogPostCtrl'
                }).when('/about', {
                    templateUrl: 'static/partials/about.html',
                    controller: 'AboutBlogCtrl'
                }).when('/login', {
                    templateUrl: 'static/partials/login.html',
                    controller: 'LoginCtrl'
                }).when('/logout', {
                    controller: 'LogoutCtrl',
                    redirectTo: '/',
                });

        $locationProvider.html5Mode(false).hashPrefix('!');
    }]);



