'use strict';

/* Directives */

var angularBlogDirectives = angular.module('angularBlogDirectives', []);
angularBlogDirectives.directive('blgTag', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/tags.html',
        scope: {},
        controller: ['$scope', 'TagList',
        function ($scope, TagList) {
            TagList.get({},
                function success(response) {
                    $scope.tags = response;
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
            );
        }],
    };
});

angularBlogDirectives.directive('blgSearch', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/search.html',
        scope: {},
        controller: ['$scope', '$location', '$cookies', '$route',
        function ($scope, $location, $cookies, $route) {
            $scope.submit = function() {
                $cookies.search_string = $scope.search_string;
                if ($cookies.search_string) {
                    $location.path('/Search/Page1');
                    $route.reload();
                }
            }
        }],
    };
});

angularBlogDirectives.directive('blgArchiveList', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/archives.html',
        controller: ['$scope', 'ArchiveList',
        function ($scope, ArchiveList) {
            ArchiveList.get({},
                function success(response) {
                    $scope.archives = response;
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
            );
        }],
    };
});

angularBlogDirectives.directive('blgCategoryList', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/categories.html',
        controller: ['$scope', 'CategoryList',
        function ($scope, CategoryList) {
            CategoryList.get({},
                function success(response) {
                    $scope.categories = response;
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
            );
        }],
    };
});

angularBlogControllers.directive('blgBreadcrumb', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/breadcrumb.html',
        controller: ['$scope', '$location',
        function($scope, $location) {
            var url = $location.url();
            var patten = /[^\/]+/g;
            var pathArray = [];
            var result = '';
            do {
                result=patten.exec(url);
                if (result!=null) {pathArray.push(result[0]);}
            } while (result != null);
            var pathList = [];
            for(var i=0;i<pathArray.length;i++) {
                var tempDict = {'name': decodeURI(pathArray[i]), 'path': pathArray.slice(0, i+1).join('/')};
                if (i == pathArray.length-1) {
                    tempDict['active'] = 'active';
                } else {
                    tempDict['active'] = '';
                }
                pathList.push(tempDict);
            }
            $scope.pathList = pathList;
        }],
        link: function (scope, el, attrs) {
        }
    };
});

angularBlogControllers.directive('blgMenu2', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/menu.html',
        controller: ['$scope', '$location', 'deleteCreds', 'checkCreds',
        function($scope, $location, deleteCreds, checkCreds) {
            $scope.loginStatus = checkCreds();

            $scope.LogoutCtrl = function() {
                deleteCreds();
                $scope.loginStatus = false;
                $location.path('/');
            };

            $scope.LoginCtrl = function() {
                $location.path('/login');
            };
        }],
        link: function (scope, el, attrs) {
        }
    };
});

angularBlogControllers.directive('blgSidebar', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/sidebar.html',
        link: function (scope, el, attrs) {
        }
    };
});

angularBlogControllers.directive('recentComment', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/recentComment.html',
        controller: ['$scope', 'RecentComment',
        function($scope, RecentComment) {
             RecentComment.get({},
                function success(response) {
                    $scope.recent_comments = response;
                },
                function error(errorResponse) {
                    console.log("Error:" + JSON.stringify(errorResponse));
                }
            );
        }],
        link: function (scope, el, attrs) {
        }
    };
});

angularBlogControllers.directive('blgPagination', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/pagination.html',
        scope: {},
        controller: ['$scope', '$location',
        function($scope, $location) {
            $scope.$on('page_load_done', function(e, arg) {
                var pageList = [];
                $scope.url = $location.url().replace(/\d+$/, '');
                $scope.currentPage = arg.currentPage;
                if ($scope.currentPage == 1)             { $scope.preDisable  = "disabled"};
                if ($scope.currentPage == arg.pageCount) { $scope.nextDisable = "disabled"};
                for (var i=$scope.currentPage-5;i<= $scope.currentPage+5;i++) {
                    if (i > 0 && i <= arg.pageCount) {
                        if (i== $scope.currentPage) {
                            pageList.push({'index':i, 'attr':'active'})
                        } else {
                            pageList.push({'index':i});
                        }
                    }
                };
                $scope.pageList = pageList;
            }

        )}],
        link: function (scope, el, attrs) {
        }
    };
});

angularBlogControllers.directive('blgFooter', function () {
    return {
        restrict: 'A',
        templateUrl: 'static/partials/footer.html',
        link: function (scope, el, attrs) {
        }
    };
});