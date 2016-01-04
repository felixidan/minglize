minglizeApp.controller('usersCtrl', ['$scope', '$http', '$timeout', function ($scope) {
    $scope.users = [];
    socket.on('users', function (data) {
        $scope.$apply(function () {
            $scope.users = data;
        });
    });
    //socket.on('end', function (code) {
    //    $scope.$apply(function () {
    //        $scope.selectedEnv.deploymentMessage += '\nFinished executing with exit code: ' + code;
    //        $scope.selectedEnv.deploymentStarted = false;
    //    });
    //});
}]);
minglizeApp.controller('loginCtrl', function () {
});

minglizeApp.controller('mingleCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.user = null;
    $http.get('/user')
        .then(function (user) {
            $scope.user = user.data;
        });


}]);