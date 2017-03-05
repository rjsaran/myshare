'use strict';
var myShare = angular.module('myShare', ['ngAnimate', 'ui.bootstrap']);

myShare.controller('mainController', function($scope, $http, $timeout) {
    var resMessage;
    $scope.resMessage = '';
    $scope.isSuccess = false;
    $scope.searchable = {};
    $scope.formData = {};
    $scope.newformData = {};
    $scope.summaryTotal = 0;
    $scope.perPerson = 0;
    $scope.user = {};
    $scope.users = {};
    $scope.tHead = ['Date', 'AMOUNT', 'BY', 'DESCRIPTION'];
    $scope.summaryThead = ['Name', 'Paid', 'Balance'];
    $scope.months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP','OCT', 'NOV', 'DEC'];
     
    $scope.datePicker = {};

    $scope.datePicker.today = function() {
      $scope.newformData.created_at = new Date();
    };
    $scope.datePicker.clear = function() {
      $scope.newformData.created_at = null;
    };
    $scope.datePicker.openModal = function() {
      $scope.datePicker.isPopupOpened = true;
    };
    $scope.datePicker.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.datePicker.format = 'dd-MMMM-yyyy';
    $scope.datePicker.isPopupOpened = false;

    function userList(cb) {
            $http.get('/users/list')
            .success(function(data) {
                $scope.users = [];
                $scope.userMap = data || {};
                for(var id in data) {
                    $scope.users.push(data[id]);
                }
                return cb();
            })
            .error(function() {
                $scope.users = {};
                return cb();
            });
    }

    function clearResMessage() {
        $timeout(function() {
            $scope.resMessage = '';
        }, 5000);
    }

    function getSession(cb) {
        $http.get('/user/session')
            .success(function(data) {
                $scope.user = data;
                return cb();
            })
            .error(function() {
                $scope.user = {};
                return cb();
            });
    }
    
    function loadDatePicker(cb) {
      $scope.datePicker.today();
      return cb();
    }

    $scope.loadShare = function() {
        var url = '/share?status=1&';
        var searchable = $scope.searchable;
        if(searchable.user_id) {
            url += 'user_id=' + searchable.user_id + "&";
        }
        var now = new Date();
        var currentMonth = $scope.months[now.getMonth()];
        searchable.month = searchable.month || currentMonth;
        url += 'month=' + $scope.months.indexOf(searchable.month);

        $http.get(url)
            .success(function(data) {   
                 
                getSession(function() {
                    userList(function() {
                        processFurther();
                    });
                }); 
                function processFurther() {
                    data.forEach(function(d) {
                        d.user_name = $scope.userMap && $scope.userMap[d.user_id] && $scope.userMap[d.user_id].name;
                    });
                    $scope.shares = data || {};
                    $scope.isSuccess = true;
                    $scope.resMessage = resMessage || '';
                    resMessage = '';
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
                                 $scope.resMessage = 'No share Found For ' + searchable.month + ' Month..';
                            });
                        }); 
                        break;
                    default:
                        $scope.resMessage = err.error;
                        break;
                }
            });
    };
    
    $scope.loadShare();
    $scope.showSummary = function() {
        var url = '/share/summary?status=1&';
        var searchable = $scope.searchable;
        if(searchable.user_id) {
            url += 'user_id=' + searchable.user_id + "&";
        }
        if(searchable.month) {
            url += 'month=' + $scope.months.indexOf(searchable.month);
        }
        $http.get(url)
        .success(function(response) {
            $scope.isSuccess = true;
            $scope.summaryTotal = response.total;
            $scope.perPerson = response.perPerson;
            var summary = response.data;
            summary.forEach(function(s) {
                s.user_name = $scope.userMap && $scope.userMap[s.user_id] && $scope.userMap[s.user_id].name;
            });
            $scope.summary = summary;
            $scope.resMessage = '';
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
                     $scope.resMessage = 'No Summary Found';
                     break;
                default:
                     $scope.resMessage = err.error;
                     break;
            }
        });
    };
    
    $scope.reset = function() {
        $scope.searchable = {};  
        $scope.loadShare();  
    };
    
    $scope.addNew = function() {
        $scope.newformData = {};

        $scope.users.forEach(function(user) {
            user.selected = false;
        });

        loadDatePicker(function() {
            angular.element('#createModal').modal('show');
        })
    };
    
    $scope.editShare = function(id) {
        $scope.formData = $scope.shares.filter(function(share) {
            return share.id == id;
        })[0];

        $scope.formData.allUserSelected = true;

        $scope.users.forEach(function(user) {
            if($scope.formData.distribute_among.indexOf(user.id) > -1) {
                user.selected = true;
            } else {
                user.selected = false;
                $scope.formData.allUserSelected = false;
            }
        });

        angular.element("#editModal").modal('show');
    };
    
    // when submitting the add form, send the text to the node API
    $scope.createShare = function() {
        var data = $scope.newformData;
        data.selectedUsers = $scope.users.map(function(user) {
            if(user.selected) {
                return Number(user.id);
            }
        }).filter(Number);

        $http.post('/share', data)
            .success(function() {
                $scope.isSuccess = true;
                angular.element('#createModal').modal('hide');
                $scope.newformData = {};
                $scope.loadShare();
                resMessage = 'Share Created Succesfully....';
                clearResMessage();
            })
            .error(function(err, status) {
                // not authorized
                $scope.isSuccess = false;
                angular.element('#createModal').modal('hide');

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
        data.selectedUsers = $scope.users.map(function(user) {
            if(user.selected) {
                return Number(user.id);
            }
        }).filter(Number);

        $http.put('/share/' + id, data)
            .success(function() {
               $scope.isSuccess = true;
               angular.element('#editModal').modal('hide'); 
               $scope.formData = {};
               $scope.loadShare();
               resMessage = 'Share Updated Succesfully....';
               clearResMessage();
            })
            .error(function(err, status) {
                // not authorized
                $scope.isSuccess = false;

                angular.element('#editModal').modal('hide'); 

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
        if(confirm('Are You Sure?')) {
            _deleteShare();
        }
        function _deleteShare() {
            $http.delete('/share/' + id)
                .success(function(data) {
                    var shares = $scope.shares.filter(function(share) {
                        return share.id != data.id;
                    });
                    $scope.shares = shares;
                    $scope.isSuccess = true;
                    $scope.resMessage = 'share deleted successfully..';
                    clearResMessage();
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
        }
    };
    
    $scope.toggleShareAmong = function(isAll, update) {
        if(isAll) {
            $scope.users.forEach(function(user) {
                user.selected = update ? !!$scope.formData.allUserSelected : !!$scope.newformData.allUserSelected;
            });
        } else {
            update ? ($scope.formData.allUserSelected = false) : $scope.newformData.allUserSelected = false;
        }
    };
    
    $scope.logout = function() {
        $http.post('/user/logout')
            .success(function() {
                window.location = '/login';
            })
            .error(function() {
                window.location = '/login';
            });
    };

});
