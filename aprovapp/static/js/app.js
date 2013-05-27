
var aprovapp = angular.module('aprovapp', []);















aprovapp.directive('ajaxReceiver', function($compile) {
    return {
         link: function(scope, element, attr) {
            scope.$watch('content', function(contents) {
                element.html(contents);
                $compile(element.contents())(scope);
            }); 
         },
     }
});

aprovapp.directive('listAjaxCall', function($http) {
    return {
        link: function(scope, element, attr) {
            element.bind('click', function(e) {
                scope.list_href = attr.href;
                scope.updateContent(attr.href);
                e.preventDefault();
            });
        }
    }
});

aprovapp.directive('ajaxCall', function($http) {
    return {
        link: function(scope, element, attr) {
            element.bind('click', function(e) {
                scope.updateContent(attr.href);
                e.preventDefault();
                e.stopPropagation();
            });
        }
    }
});


aprovapp.controller('MainAreaCtrl', function($scope, $http) {
    
    $scope.content = '';
    $scope.list_href = '#';
    $scope.actual_href = '#';

    $scope.updateContent = function(href) {
        $http.get(href).then(function(response) {
            $scope.content = response.data;
            $scope.actual_href = href;
        });
    }

    $scope.$on('formPost', function(scope, response) {
        $scope.content = response;
    });

    $scope.$on('ajaxFailure', function(scope) {
        $scope.content = 'Error!';
    })

});





















aprovapp.directive('ajaxForm', function() {
    return {
        link: function(scope, element, attr) {
            scope.action = attr.action
            element.bind('submit', function(e) {
                scope.postForm();
                e.preventDefault();
            })
        }
    }
});

aprovapp.directive('submitType', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.bind('click', function(e){
                attr.$observe('submitType', function(val) {
                    scope.submit_type = val;
                });    
            });
        }
    }
});


aprovapp.controller('formController', function($scope, $http) {

    $scope.action = '#';
    $scope.submit_type = '';
    $scope.data = {};

    $scope.postForm = function() {
        
        $http({
            method: 'POST',
            url: $scope.action,
            data: $.param($scope.data),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        
        }).success(function(response) {
            console.log($scope.submit_type);
            switch($scope.submit_type) {
                case 'add-other':
                    $scope.updateContent($scope.actual_href);
                    $scope.data = {};
                    break;
                case 'back-to-list':
                    $scope.updateContent($scope.list_href);
                    break;
                case 'continue-editing':
                    $scope.updateContent($scope.actual_href);
                    break;
                default:
                    $scope.updateContent($scope.list_href);
            } 
        
        }).error(function(data, status) {
            switch(status) {
                case 400:
                    $scope.$emit('formPost', data);
                    break;
                default:
                    $scope.$emit('ajaxFailure', data);
            }
        });
    }

});

























aprovapp.directive('selectableRow', function() {

    return {
        
        controller: function($scope, $element, $attrs) {
            return {
                checkRow: function(id) {
                    $element.addClass('selected');
                    deregister = $scope.$on('entryRemoval', function() {
                        console.log('HERE IS BIND');
                        $attrs.$observe('selectableRow', function(val) {
                            console.log(val);
                            if(val == id) {
                                console.log(id);
                                $element.remove();
                                $scope.removeFromSelection(id);
                            }
                        });
                    })
                    $scope.addToSelection(id, deregister);
                },
                uncheckRow: function(id) {
                    $element.removeClass('selected');
                    $scope.removeFromSelection(id);
                    console.log('HERE IS UNBIND');
                },
            }
        },
        
        link: function(scope, element, attr, controller) {

            element.bind('click', function(e) {
                
                el = $(this);
                chkbox = el.find('input[type=checkbox]:first');
                console.log(chkbox);

                if(chkbox.is(':checked')) {
                    chkbox.prop('checked',false);
                    controller.uncheckRow(chkbox.prop('value'));

                } else {
                    chkbox.prop('checked',true);
                    controller.checkRow(chkbox.prop('value'));
                }

            });

        },
    }

});

aprovapp.directive('selectCheckbox', function() {
    return {
        link: function(scope, element, attr, selectable_ctrl) {
            element.bind('click', function(e) {
                el = $(this);
                if(el.is(':checked')) {
                    selectable_ctrl.checkRow(attr.value);
                }
                else {
                    selectable_ctrl.uncheckRow(attr.value);
                }
                e.stopPropagation();
            })
        },
        require: '^selectableRow'
    }
});


aprovapp.directive('removeSelected', function() {

    return {
        link: function(scope, element, attr) {
            scope.delete_url = attr.href;
            element.bind('click', function(e) {
                scope.removeEntries();
                e.preventDefault();
            });
        }
    }

});


aprovapp.controller('objectList', function($scope, $http) {

    $scope.selection = {};
    $scope.delete_url = '#';
    $scope.deregister_function = {};

    $scope.addToSelection = function(id, deregister_function) {
        $scope.selection[id] = true;
        $scope.deregister_function[id] = deregister_function;
    }

    $scope.removeFromSelection = function(id) {
        if(id in $scope.selection) {
            $scope.deregister_function[id]();
            delete $scope.selection[id];
            delete $scope.deregister_function[id];
        }
    }

    $scope.removeEntries = function() {
        for(id in $scope.selection) {
            $scope.removeEntry(id);
        }
    }

    $scope.removeEntry = function(id) {
        $http.get($scope.delete_url + id + '/').success(function(response, status) {
            $scope.$emit('entryRemoval',id);
            $scope.removeFromSelection(id);
        });
    }

});




