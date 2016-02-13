var login = angular.module('login', []);

login.controller('loginController', function($scope, $http) {
    
    $scope.responseMsgs = {
        signup: '',
        login: ''
    };
    function checkSession() {
        $http.post('/user/checkSession') 
            .success(function(data) {
                window.location ='/';
            })
            .error(function(err, status) {
                if(status == 500) {
                    alert('something bad happened .. try again later ')
                }
            });
    };
    
    checkSession();
    
    $scope.signup = function() {
        $http.post('/user/signup', $scope.signupFormData)
            .success(function(data) {
                $scope.responseMsgs = {};
                window.location = '/';
            })
            .error(function(err, status) {
                $scope.responseMsgs.signup = err.error || 'please try again later.';
            });
    };

    $scope.login = function() {
        $http.post('/user/login', $scope.loginFormData)
            .success(function(data) {
                $scope.responseMsgs = {};
                window.location = '/';
            })
            .error(function(err, status) {
                switch(status) {
                    case 450:
                        $scope.responseMsgs.login = 'Please Register Before Login.';
                        break;
                    default:
                        $scope.responseMsgs.login = err.error || 'please try again later.';
                }
            });
    };
});
