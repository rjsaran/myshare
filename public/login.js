var login = angular.module('login', []);

function loginController($scope, $http) {
    
    function checkSession() {
        $http.post('/user/checkSession') 
            .success(function(data) {
                window.location ='/';
            })
            .error(function(err, status) {
                if(status == 500) {
                    alert('something bad happened .. try again later ')
                }
            })
    };
    
    checkSession();
    
    $scope.signup = function() {
        $http.post('/user/signup', $scope.signupFormData)
            .success(function(data) {
                window.location = '/';
            })
            .error(function(err, status) {
                alert(err.error || 'please try again later');
                $scope.responseMsg = err.error;
            });
    };

    $scope.login = function() {
        $http.post('/user/login', $scope.loginFormData)
            .success(function(data) {
                window.location = '/';
            })
            .error(function(err, status) {
                switch(status) {
                    case 450:
                        alert('Look like first time user... please register to continue..');
                        break;
                    default:
                        alert(err.error || 'please try again later');
                        $scope.responseMsg = err.error;                       
                }
            });
    };
}
