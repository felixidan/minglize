minglizeApp.controller('usersCtrl', ['$scope', '$http', '$timeout', function ($scope, $http) {

    console.log('here');
    $scope.users = [];
    function getUsers() {
        $http.get('/users')
            .then(function (users) {
                $scope.users = users.data;
                console.log($scope.users);
            });
    }

    getUsers();
    //var socket = io('http://localhost:3000');
    //socket.emit('deploy', data);


    //socket.on('progress', function (data) {
    //    $scope.$apply(function () {
    //        $scope.selectedEnv.deploymentMessage += data;
    //    });
    //});
    //socket.on('end', function (code) {
    //    $scope.$apply(function () {
    //        $scope.selectedEnv.deploymentMessage += '\nFinished executing with exit code: ' + code;
    //        $scope.selectedEnv.deploymentStarted = false;
    //    });
    //});
}]);
minglizeApp.controller('loginCtrl', function () {
});