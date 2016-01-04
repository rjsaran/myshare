'use strict';
var myShare = angular.module('myShare', []);

myShare.controller('mainController', function($scope, $http) {
    $scope.responseMsg = '';
    $scope.isSuccess = false;
    $scope.searchable = {};
    $scope.formData = {};
    $scope.tHead = ['Date', 'AMOUNT', 'BY', 'DECRIPTION', 'EDIT', 'DELETE'];
    $scope.months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP','OCT', 'NOV', 'DEC'];
     
    $scope.userList = function() {
            $http.get('/users/list')
            .success(function(data) {
                $scope.users = [];
                $scope.userMap = data || {};
                for(var id in data) {
                    $scope.users.push(data[id]);
                }
            })
            .error(function(err, status) {
                switch (status) {
                    case 401:
                        window.location = '/login';
                        break;
                    case 450:
                        $scope.users = {};
                        break;
                }
            });
    }
               
    $scope.loadShare = function() {
        var url = '/share?status=1&';
        var searchable = $scope.searchable;
        if(searchable.user_id) {
            url += 'user_id=' + searchable.user_id + "&";
        }
        if(searchable.month) {
            url += 'month=' + $scope.months.indexOf(searchable.month)
        }
        $http.get(url)
            .success(function(data) {
                data.forEach(function(d) {
                   d.user_name =  $scope.userMap[d.user_id].name;
                });
                $scope.shares = data || {};
                $scope.isSuccess = true;
                $scope.responseMsg = '';
            })
            .error(function(err, status) {
                // not authorized
                $scope.isSuccess = false;
                switch (status) {
                    case 401:
                        window.location = '/login';
                        break;
                    case 450:
                        $scope.shares = {};
                        $scope.responseMsg = '';
                        break;
                    default:
                        $scope.responseMsg = err.error;
                        break;
                }
            });
    }
    
    $scope.userList();
    $scope.loadShare();
    
    $scope.loadSummary = function() {
        $http.get('/share/summary')
        .success(function(data) {
            $scope.isSuccess = true;
            $scope.responseMsg = '';
        })
        .error(function(err, status) {
            // not authorized
            $scope.isSuccess = false;
            switch (status) {
                case 401:
                    window.location = '/login';
                    break;
                case 450:  
                     $scope.responseMsg = ''
                     break;
                default:
                     $scope.responseMsg = err.error;
                     break;
            }
        });
    }
    
    $scope.reset = function() {
        $scope.searchable = {};  
        $scope.loadShare();  
    }
    
    $scope.addNew = function() {
        angular.element('#createModal').modal('show');
    }
    
    $scope.editShare =function(id) {
        $scope.shares.forEach(function(share) {
            if(share.id == id) {
                 $scope.formData = share;     
            }
        });
        angular.element("#editModal").modal('show');
    }
    
    // when submitting the add form, send the text to the node API
    $scope.createShare = function() {
        var data = $scope.formData;
        $http.post('/share', data)
            .success(function(data) {
                $scope.formData = {}; 
                angular.element('#createModal').modal('hide'); 
                $scope.formData = {};
                $scope.loadShare(); 
            })
            .error(function(err, status) {
                // not authorized
                $scope.isSuccess = false;
                 switch (status) {
                    case 401:
                        window.location = '/login';
                        break;
                    default:
                        $scope.responseMsg = err.error;
                        break;
                }
            });
    };

    // mark complete a todo after checking it
    $scope.updateShare = function(id) {
        var data = $scope.formData;
        $http.put('/share/' + id, data)
            .success(function(data) {
               angular.element('#editModal').modal('hide'); 
               $scope.formData = {};
               $scope.loadShare();
            })
            .error(function(err, status) {
                // not authorized
                $scope.isSuccess = false;
                 switch (status) {
                    case 401:
                        window.location = '/login';
                        break;
                    default:
                        $scope.responseMsg = err.error;
                        break;
                }
            });
    };
    
    // delete  a todo
    $scope.deleteShare = function(id) {
        $http.delete('/share/' + id)
            .success(function(data) {
                var shares = $scope.shares.filter(function(share) {
                    return share.id != data.id;
                });
                $scope.shares = shares;
                $scope.isSuccess = true;
                $scope.responseMsg = 'share deleted successfully..'
            })
            .error(function(err, status) {
                // not authorized
                $scope.isSuccess = false;
                 switch (status) {
                    case 401:
                        window.location = '/login';
                        break;
                    case 450:
                        $scope.responseMsg = '';
                        break;
                    default:
                        $scope.responseMsg = err.error;
                        break;
                }
            });
    };
    
    $scope.logout = function() {
        $http.post('/user/logout')
            .success(function(data) {
                window.location = '/login';
            })
            .error(function(err, status) {
                window.location = '/login'
            });
    };

});
