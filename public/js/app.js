var minglizeApp = angular.module('minglizeApp', ['luegg.directives', 'ui.router']);
var socket = io('http://minglize.io:1111');

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
            })
            .state('mingle', {
                url: '/mingle',
                templateUrl: '/views/partials/mingle',
                controller: 'mingleCtrl'
            });
        $urlRouterProvider.otherwise('/users');
    });


minglizeApp.run(['$state', function ($state) {
    socket.on('pairingStarted', function () {
        $state.go('mingle');
    });
}]);