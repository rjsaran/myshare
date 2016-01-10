'use strict';
var myShare = angular.module('myShare', []);

myShare.controller('mainController', function($scope, $http) {
    $scope.resMessage = '';
    $scope.isSuccess = false;
    $scope.searchable = {};
    $scope.formData = {};
    $scope.summaryTotal = 0;
    $scope.perPerson = 0;
    $scope.user = {};
    $scope.isAdmin = false;
    $scope.users = {};
    $scope.tHead = ['Date', 'AMOUNT', 'BY', 'DESCRIPTION'];
    $scope.summaryThead = ['Name', 'Paid', 'Balance'];
    $scope.months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP','OCT', 'NOV', 'DEC'];
     
    var userList = function(cb) {
            $http.get('/users/list')
            .success(function(data) {
                $scope.users = [];
                $scope.userMap = data || {};
                for(var id in data) {
                    $scope.users.push(data[id]);
                }
                return cb();
            })
            .error(function(err, status) {
                $scope.users = {};
                return cb();
            });
    }
    
    
    var getSession = function(cb) {
        $http.get('/user/session')
            .success(function(data) {
                $scope.user = data;
                $scope.isAdmin = !!data.type;
                return cb();
            })
            .error(function(err, status) {
                $scope.user = {};
                return cb();
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
                 
                getSession(function() {
                    userList(function() {
                        processFurther();
                    });
                }); 
                function processFurther() {
                    data.forEach(function(d) {
                        d.user_name =  $scope.userMap[d.user_id].name;
                    });
                    $scope.shares = data || {};
                    $scope.isSuccess = true;
                    $scope.resMessage = '';   
                }
            })
            .error(function(err, status) {
                // not authorized
                $scope.isSuccess = false;
                switch (status) {
                    case 401:
                        window.location = '/login';
                        break;
                    case 450:
                        getSession(function() {
                            userList(function() {
                                 $scope.shares = {};
                                 $scope.resMessage = 'No share Found....';
                            });
                        }); 
                        break;
                    default:
                        $scope.resMessage = err.error;
                        break;
                }
            });
    }
    
    $scope.loadShare();
    $scope.showSummary = function() {
        var url = '/share/summary?status=1&';
        var searchable = $scope.searchable;
        if(searchable.user_id) {
            url += 'user_id=' + searchable.user_id + "&";
        }
        if(searchable.month) {
            url += 'month=' + $scope.months.indexOf(searchable.month)
        }
        $http.get(url)
        .success(function(response) {
            $scope.isSuccess = true;
            $scope.summaryTotal = response.total;
            $scope.perPerson = response.perPerson;
            var summary = response.data;
            summary.forEach(function(s) {
                s.user_name =  $scope.userMap[s.user_id].name;
            });
            $scope.summary = summary;
            angular.element('#summaryModal').modal('show');
        })
        .error(function(err, status) {
            // not authorized
            $scope.isSuccess = false;
            switch (status) {
                case 401:
                    window.location = '/login';
                    break;
                case 450:  
                     $scope.resMessage = 'No Summary Found'
                     break;
                default:
                     $scope.resMessage = err.error;
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
                 $scope.formData = {
                     id: share.id,
                     description: share.description,
                     amount: share.amount
                 }
            }
        });
        angular.element("#editModal").modal('show');
    }
    
    // when submitting the add form, send the text to the node API
    $scope.createShare = function() {
        var data = $scope.newformData;
        $http.post('/share', data)
            .success(function(data) {
                $scope.isSuccess = true;
                angular.element('#createModal').modal('hide');
                $scope.resMessage = 'Share Created Succesfully....';
                $scope.newformData = {};
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
                        $scope.resMessage = err.error;
                        break;
                }
            });
    };

    // mark complete a todo after checking it
    $scope.updateShare = function(id) {
        var data = $scope.formData;
        $http.put('/share/' + id, data)
            .success(function(data) {
               $scope.isSuccess = true;
               angular.element('#editModal').modal('hide'); 
               $scope.formData = {};
               $scope.resMessage = 'Share Updated Succesfully....';
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
                        $scope.resMessage = err.error;
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
                $scope.resMessage = 'share deleted successfully..'
            })
            .error(function(err, status) {
                // not authorized
                $scope.isSuccess = false;
                 switch (status) {
                    case 401:
                        window.location = '/login';
                        break;
                    default:
                        $scope.resMessage = err.error;
                        break;
                }
            });
    };
    
    $scope.toggleAll = function() {
        var users = $scope.users
        $scope.formData.selectedUser = {};
        users.forEach(function(user) {
            var uid = user.id;
            $scope.formData.selectedUser[uid] = !!$scope.formData.selectedUserAll; 
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
