/* /assets/js/init.js */
/**
 * App Initialization Models for setting up and configuring AngularJS.
 */
var Yaba = (function(Yaba) {

    Yaba || ( Yaba = {} );
    Yaba.hasOwnProperty('app') || (Yaba.app = angular.module('yaba', ['ngRoute', 'ngAnimate', 'ngMessages', 'ngMaterial']));

    // AngularJS Client Interactions
    function pageConfig($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);
        const pages = [
            '/home',
            '/budget',
            '/prospect',
            '/charts',
            '/accounts',
            '/institutions',
            '/settings'
        ];
        pages.forEach((page) => {
            $routeProvider.when(page, { templateUrl: `/assets/views/${page}.htm` });
        })
        $routeProvider.when('/', { templateUrl: `/assets/views/home.htm` });
        $routeProvider.otherwise({ template: '<h1>404</h1><p>Page not found!</p><br />Route: {{ $route }}' });
    }

    Yaba.app.config(pageConfig);

    return Yaba;
})(Yaba);
