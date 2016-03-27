'use strict';

/* Controllers */

var angularBlogControllers = angular.module('angularBlogControllers', []);


angularBlogControllers.controller('BlogCtrl', ['$scope', '$routeParams', 'BlogList', '$location', 'checkCreds',
    function BlogCtrl($scope, $routeParams, BlogList, $location, checkCreds) {
        var page_no = parseInt($routeParams.page_no);
        $scope.blogList = [];
        BlogList.get({page_no: page_no},
                function success(response) {
                    $scope.blogList = response.items;
                    var pageCount = parseInt(response.pageCount);
                    $scope.$broadcast('page_load_done', {'pageCount':pageCount, 'currentPage': page_no})
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
        );
    }]);

angularBlogControllers.controller('TagCtrl', ['$scope', '$routeParams', 'Tag', '$location', 'checkCreds',
    function TagCtrl($scope, $routeParams, Tag, $location, checkCreds) {
        var page_no  = parseInt($routeParams.page_no);
        var tag_type = $routeParams.tag_type;
        $scope.blogList = [];
        Tag.get({page_no: page_no, tag_type: tag_type},
                function success(response) {
                    $scope.blogList = response.items;
                    var pageCount = parseInt(response.pageCount);
                    $scope.$broadcast('page_load_done', {'pageCount':pageCount, 'currentPage': page_no})
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
        );
    }]);

angularBlogControllers.controller('ArchiveCtrl', ['$scope', '$routeParams', 'Archive', '$location',
    function ArchiveCtrl($scope, $routeParams, Archive, $location) {
        var page_no  = parseInt($routeParams.page_no);
        var year = parseInt($routeParams.year);
        var month = parseInt($routeParams.month);
        $scope.blogList = [];
        Archive.get({year: year, month: month, page_no: page_no},
                function success(response) {
                    $scope.blogList = response.items;
                    var pageCount = parseInt(response.pageCount);
                    $scope.$broadcast('page_load_done', {'pageCount':pageCount, 'currentPage': page_no})
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
        );
    }]);

angularBlogControllers.controller('SearchCtrl', ['$scope', '$routeParams', 'Search', '$location', '$cookies',
    function ArchiveCtrl($scope, $routeParams, Search, $location, $cookies) {
        var page_no  = parseInt($routeParams.page_no);
        $scope.blogList = [];
        Search.post({page_no: page_no, search_string: $cookies.search_string},
                function success(response) {
                    $scope.blogList = response.items;
                    var pageCount = parseInt(response.pageCount);
                    $scope.$broadcast('page_load_done', {'pageCount':pageCount, 'currentPage': page_no})
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
        );
    }]);

angularBlogControllers.controller('CategoryCtrl', ['$scope', '$routeParams', 'Category', '$location',
    function ArchiveCtrl($scope, $routeParams, Category, $location) {
        var page_no  = parseInt($routeParams.page_no);
        var type = $routeParams.type;
        $scope.blogList = [];
        Category.get({type: type, page_no: page_no},
                function success(response) {
                    $scope.blogList = response.items;
                    var pageCount = parseInt(response.pageCount);
                    $scope.$broadcast('page_load_done', {'pageCount':pageCount, 'currentPage': page_no})
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
        );
    }]);

angularBlogControllers.controller('BlogViewCtrl', ['$scope', '$routeParams', 'BlogPost', 'Comments', '$location', 'checkCreds', '$http', 'getToken', '$route',
    function BlogViewCtrl($scope, $routeParams, BlogPost, Comments, $location, checkCreds, $http, getToken, $route) {
        var blogId = $routeParams.id;
        $scope.edit_page_url = "EditPost"+blogId;
        BlogPost.get({id: blogId},
            function success(response) {
                $scope.blogEntry = response;
                $scope.blogId = response.id;
            },
            function error(errorResponse) {
                console.log("Error:" + JSON.stringify(errorResponse));
                alert("page not found");
                $location.path('/');
                $route.reload();
            }
        );

        Comments.get({id:blogId},
            function success(response) {
                    $scope.comments = response;
                },
            function error(errorResponse) {
                console.log("Error:" + JSON.stringify(errorResponse));
            }
        );

        $scope.submit = function() {
            if (!checkCreds()) {
                $location.path('/login');
            }
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getToken();
            var postData = {
                "body": $scope.commentText,
            };
            Comments.save({id:$scope.blogId}, postData,
                function success(response) {
                    $location.path('/blogPost'+$scope.blogId);
                    console.log("reload after comments")
                    $route.reload();
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
            );
            
        };

    }]);

angularBlogControllers.controller('LoginCtrl', ['$scope', '$location', 'Login', 'setCreds', 'checkCreds',
    function LoginCtrl($scope, $location, Login, setCreds, checkCreds) {
        if (!checkCreds()) {
            $location.path('/login');
        }
        $scope.submit = function() {
            $scope.sub = true;
            var postData = {
                "email": $scope.email,
                "pwd": $scope.password
            };
            Login.login({}, postData,
                    function success(response) {
                        console.log("Success:" + JSON.stringify(response));
                        if (response.authenticated) {
                            console.log(response);
                            setCreds($scope.email, response.token)
                            $location.path('/');
                        } else {
                            $scope.error = "Login Failed"
                        }
                    },
                    function error(errorResponse) {
                        console.log("Error:" + JSON.stringify(errorResponse));
                    }
            );

        };
    }]);

angularBlogControllers.controller('NewBlogPostCtrl', ['$scope', 'filterFilter', 'BlogPost', 'TagList', '$location', 'checkCreds', '$http', 'getToken', '$route', '$routeParams',
    function NewBlogPostCtrl($scope, filterFilter, BlogPost, TagList, $location, checkCreds,
    $http, getToken, $route, $routeParams) {
        if (!checkCreds()) {
            $location.path('/login');
        }
        $scope.error = {'show':'invisible', 'message':''}
        $scope.cat = {};
        $scope.main_tags = [];
        $scope.url = $location.url();
        TagList.get_no_cache({},
            function success(response) {
                for(var i in response){
                    if(response[i].tag_type) {
                        $scope.main_tags.push({"tag_type":response[i].tag_type, "selected":false});
                    }
                }
            },
            function error(errorResponse) {
                console.log("Error:" + JSON.stringify(errorResponse));
            }
        );

        $scope.addTag = function() {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getToken();
            var postData = {
                "tag_type": $scope.newTag,
            };

            TagList.save({}, postData,
                    function success(response) {
                        console.log("Success:" + JSON.stringify(response));
                        $route.reload($scope.url);
                    },
                    function error(errorResponse) {
                        console.log("Error:" + JSON.stringify(errorResponse));
                    }
            );
        }

        $scope.submit = function() {
            $scope.sub = true;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getToken();
            var tagList = []
            for (var i in $scope.main_tags) {
                if ($scope.main_tags[i].selected == true) {
                    tagList.push($scope.main_tags[i].tag_type);
                }
            }
            var postData = {
                "title": $scope.introText,
                "text" : $scope.blogText,
                "category_id": $scope.cat.category_id,
                "tags": tagList,
            };

            BlogPost.save({}, postData,
                function success(response) {
                    $scope.error = {'show':'invisible', 'message':''};
                    console.log("Success:" + JSON.stringify(response));
                    $location.path('/');
                },
                function error(errorResponse) {
                    $scope.error.show = '';
                    if (parseInt(errorResponse.status) == 401) {
                        $scope.error.message = "Login expired, please login again";
                        $location.path('/login');
                    } else {
                        $scope.error.message = "Your Post is invalid!";
                    }
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
            );
        };

    }]);

angularBlogControllers.controller('EditPostCtrl', ['$scope', 'filterFilter', 'BlogPost', 'TagList', '$location', 'checkCreds', '$http', 'getToken', '$route', '$routeParams',
    function NewBlogPostCtrl($scope, filterFilter, BlogPost, TagList, $location, checkCreds,
    $http, getToken, $route, $routeParams) {
        if (!checkCreds()) {
            $location.path('/login');
        }
        $scope.error = {'show':'invisible', 'message':''}
        var blogId = $routeParams.id;
        $scope.cat = {};
        $scope.url = $location.url();
        BlogPost.get_no_cache({id: blogId},
            function success(response) {
                $scope.blogId = parseInt(response.id);
                $scope.blogText = response.text;
                $scope.introText = response.title;
                $scope.cat.category_id = parseInt(response.category);
                $scope.tags = response.tags;
                $scope.$broadcast('post_load_done', {'message':'done'});
            },
            function error(errorResponse) {
                console.log("Error:" + JSON.stringify(errorResponse));
            }
        );

        $scope.$on('post_load_done', function(e, arg) {
            $scope.main_tags = [];
            TagList.get_no_cache({},
                function success(response) {
                    $scope.main_tags = response.filter(function(element, index, array){
                        return element.tag_type != null;
                    });
                    for(var i in $scope.main_tags) {
                        $scope.main_tags[i].selected = false;
                        for(var j in $scope.tags) {
                            if ($scope.main_tags[i].tag_type == $scope.tags[j].tag_type) {
                                $scope.main_tags[i].selected = true;
                            }
                        }
                    };
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
            );

        });

        $scope.addTag = function() {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getToken();
            var postData = {
                "tag_type": $scope.newTag,
            };

            TagList.save({}, postData,
                    function success(response) {
                        console.log("Success:" + JSON.stringify(response));
                        $route.reload($scope.url);
                    },
                    function error(errorResponse) {
                        console.log("Error:" + JSON.stringify(errorResponse));
                    }
            );
        }

        $scope.submit = function() {
            $scope.sub = true;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getToken();
            var tagList = []
            for (var i in $scope.main_tags) {
                if ($scope.main_tags[i].selected == true) {
                    tagList.push($scope.main_tags[i].tag_type);
                }
            }
            var postData = {
                "title": $scope.introText,
                "text" : $scope.blogText,
                "category_id": $scope.cat.category_id,
                "tags": tagList,
            };

            BlogPost.save({id: blogId}, postData,
                function success(response) {
                    $scope.error = {'show':'invisible', 'message':''};
                    console.log("Success:" + JSON.stringify(response));
                    $location.path('/');
                },
                function error(errorResponse) {
                    $scope.error.show = '';
                    if (parseInt(errorResponse.status) == 401) {
                        $scope.error.message = "Login expired, please login again";
                        $location.path('/login');
                    } else {
                        $scope.error.message = "Your Post is invalid!";
                    }
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
            );
        };

    }]);

angularBlogControllers.controller('AboutBlogCtrl', ['$scope', '$location', 'checkCreds',
    function AboutBlogCtrl($scope, $location, checkCreds) {
        $scope.aboutActiveClass = "active";
    }]);
