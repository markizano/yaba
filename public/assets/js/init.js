/* These methods are extensions of built-ins we wish to append functionality. */
(function() {
    if ( typeof Object.defineProperty == 'function' ) {
        try{ Object.defineProperty(Date.prototype, 'toISOShortDate', {value: toISOShortDate}); } catch(e){}
        try{ Object.defineProperty(Date.prototype, 'round', {value: round}); } catch(e){}
    }
    if ( !Date.prototype.toISOShortDate ) Date.prototype.toISOShortDate = toISOShortDate;
    if ( !Date.prototype.round ) Date.prototype.round = round;
    function toISOShortDate() {
        let yyyy = this.getFullYear(),
          mm = ('0' + (this.getUTCMonth()+1)).slice(-2),
          dd = ( '0' + this.getUTCDate()).slice(-2);
        return [yyyy, mm, dd] .join('-')
    }
    function round() {
        const result = new Date(this);
        result.setUTCMilliseconds(0);
        result.setUTCSeconds(0);
        result.setUTCMinutes(0);
        result.setUTCHours(0);
        result.setUTCDate(1);
        return result;
    }
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

    const ngModelList = [
        'ngRoute',
        'ngAnimate',
        'ngMessages',
        'ngMaterial',
    ];
    Yaba || ( Yaba = {} );
    Yaba.hasOwnProperty('app') || (Yaba.app = angular.module('yaba', ngModelList));

    // Whether to actively render debugging informations, details and other infos.
    Yaba.DEBUG = window.location.hostname != 'yaba.markizano.net';
    // Feature check to see if developer-friendly options should be available.
    Yaba.mode = Yaba.DEBUG? 'dev': 'prod';

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
    if ( Yaba.mode == 'dev' ) {
        pages.push('develop');
    }

    /**
     * Providing this function to AngularJS to configure the service providers to setup the
     * navigation and router.
     */
    function pageConfig($locationProvider, $routeProvider, $mdDateLocaleProvider) {
        $locationProvider.html5Mode(true);
        pages.forEach((page) => {
            var whence = page == 'account'? `/${page}/:accountId`: `/${page}`;
            $routeProvider.when(whence, { templateUrl: `assets/views/${page}.htm` });
        })
        $routeProvider.when('/', { templateUrl: `assets/views/home.htm` });
        $routeProvider.otherwise({
            template: '<h1>404</h1><p>Page not found!</p><br />CurrentPage: {{ $id }}',
        });
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
        $rootScope.$on('$locationChangeSuccess', function() {
            $scope.currentPage = $location.path().split('/').filter(x => x).shift();
        });
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
                    var navPage = $(li.children()[0]).attr('data-page');
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
            console.error(response);
            return false;
        }
    });
})(Yaba)
