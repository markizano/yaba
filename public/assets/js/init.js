const DEBUG=true;
/* These methods are extensions of built-ins we wish to append functionality. */
(function() {
    function telescope(path='') {
        function index(parent, searchKey) {
            return parent[searchKey];
        }
        return path.toString().split('.').reduce(index, this);
    }
    Object.prototype.telescope = telescope;
    Date.prototype.toISOShortDate = function toISOShortDate() {
        let yyyy = this.getFullYear(),
          mm = ('0' + (this.getMonth()+1)).slice(-2),
          dd = ( '0' + this.getDate()).slice(-2);
        return [yyyy, mm, dd] .join('-')
    };
    Math.parseCurrency = (value) => {
        return Number(value.replace(/[^0-9\.-]+/g, '') );
    }
})();

/**
 * App Initialization Models for setting up and configuring AngularJS.
 * This is the first time we use it, so it'll be the first time we define it.
 */
var Yaba = (function(Yaba) {
    'use strict';

    Yaba || ( Yaba = {} );
    Yaba.hasOwnProperty('app') || (Yaba.app = angular.module('yaba', ['ngRoute', 'ngAnimate', 'ngMessages', 'ngMaterial']));

    // Used later on to describe the navigation.
    const pages = [
        'home',
        'budget',
        'prospect',
        'charts',
        'accounts',
        'account',
        'institutions',
        'settings'
    ];

    /**
     * Providing this function to AngularJS to configure the service providers to setup the
     * navigation and router.
     */
    function pageConfig($locationProvider, $routeProvider, $mdDateLocaleProvider) {
        $locationProvider.html5Mode(true);
        pages.forEach((page) => {
            var whence = page == 'account'? `/${page}/:accountId`: `/${page}`;
            $routeProvider.when(whence, { templateUrl: `/assets/views/${page}.htm` });
        })
        $routeProvider.when('/', { templateUrl: `/assets/views/home.htm` });
        $routeProvider.otherwise({ template: '<h1>404</h1><p>Page not found!</p><br />Route: {{ $route }}' });
        $mdDateLocaleProvider.dateFormat = (d) => {
            if ( typeof d == 'string' ) {
                d = new Date(d);
            }
            return d.toISOShortDate();
        };
    }
    pageConfig.$inject = ['$locationProvider', '$routeProvider', '$mdDateLocaleProvider'];
    Yaba.app.config(pageConfig);

    /**
     * Navigation Controller for the directive we create around the navigation.
     * Simply watches for router location changes and updates the scope variable
     * for us since we can't access $location from inside the directive:link() function.
     */
    function navCtrl($rootScope, $scope, $location) {
        $rootScope.$on('$locationChangeSuccess', (e) => {
            $scope.currentPage = $location.path().split('/').filter(x => x).shift();
        })
    }
    navCtrl.$inject = ['$rootScope', '$scope', '$location'];

    /**
     * Navigation directive that will update CSS accordingly so we can see which
     * page we are currently browsing.
     */
    function navigation($scope, $element, $attrs) {
        $scope.$watch('currentPage', () => {
            $element.children().each(function() {
                var ul = $(this);
                ul.children().each(function() {
                    var li = $(this);
                    var navPage = $(li.children()[0]).attr('href').split('/').filter(x => x).shift();
                    if ( $scope.currentPage == navPage ) {
                        li.addClass('nav-active');
                    } else {
                        li.removeClass('nav-active');
                    }
                });
            });
        });
    }

    Yaba.app.directive('navigation', () => {
        return {
            scope: true, // Inherited scope. Isolated not necessary, but don't want to clutter global/root $scope.
            controller: navCtrl,
            link: navigation
        };
    });

    return Yaba;
})(Yaba);

(function(Yaba) {
    Yaba.hasOwnProperty('utils') || (Yaba.utils = {
        reject: function handleError(response) {
            console.error('Promise rejection error.');
            console.log(response);
            return false;
        }
    })
})(Yaba)
