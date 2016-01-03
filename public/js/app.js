var minglizeApp = angular.module('minglizeApp', ['luegg.directives', 'ui.router']);

minglizeApp
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('users', {
                url: '/users',
                templateUrl: '/views/partials/users',
                controller: 'usersCtrl'
            })
            .state('login', {
                url: '/login',
                templateUrl: '/views/account/login',
                controller: 'loginCtrl'
            });
        $urlRouterProvider.otherwise('/users');
    });