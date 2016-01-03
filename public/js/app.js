var minglizeApp = angular.module('appcloudDeployApp', ['luegg.directives', 'ui.router']);

minglizeApp
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/views/home',
                controller: 'homeCtrl'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: '/views/settings',
                controller: 'settingsCtrl'
            });

        $urlRouterProvider.otherwise('/instances');
    });