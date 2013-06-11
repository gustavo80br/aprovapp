"use strict";

var aprovapp = angular.module('aprovapp', []);

registerModal(aprovapp);




















/**

@module AJAX CALL
==================

Module to load content by Ajax and update a container with the response

*/

/**

@controller MainAreaCtrl

Controller that has in the scope variables to track the href that has been
loaded by the ajaxCall directive.

*/
aprovapp.controller('MainAreaCtrl',
    ['$scope','$http', 'modal', 'dontTouch', function($scope, $http, modal, dontTouch) {
    
    $scope.content = '';
    $scope.list_href = '#';
    $scope.actual_href = '#';

    $scope.updateContent = function(href) {
        modal.alert('titulo','texto');
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

}]);


/**

@directive ajaxReceiver

Directive for the TAG that will receive the AjaxCall response

*/
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

/**

@directive ajaxCall

Directive for the A TAG that will call href by Ajax and
update the tag content with the directive ajaxReceiver

*/
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

/**

@directive listAjaxCall

Directive for the A TAG that will call href by Ajax.
Differs from the simple ajaxCall directive because keeps
recorded the href called in the scope. This behaviour was
created so that when doing Form ajax call, after form submit
the interface can come back to the previous page

*/
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















/**

@module AJAX FORM
==================

Module to submit Forms by Aajax. 
The form need to be inner the MainAreaCtrl controller

*/


/**

@directive ajaxForm

Directive for the FORM TAG that will post a form by ajax.

*/
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

/**

@directive submitType

Directive for the SUBMIT BUTTON that will indicate the action after the 
form post. Supported values:

add-other           after the form submit, reloads the form with empty values so the
                    user can fill and submit again.

back-to-list        after the form submit, comes back to the previous href loaded
                    in the MainAreaController.

continue-editing    the form is submit, but nothing happend, the form still
                    keep it's values so the user can keep editing the content
                    and then submit again

*/
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


/**

@directive formController

Controller for the FORM TAG scope

*/
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






















/**

@module OBJECT LIST
====================

Module to enhance a table of objects that can be selected and deleted in group.

*/

/**

@controller objectList

Controller for the object list TABLE scope.

*/
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


/**

@directive selectableRow

Directive for the TR TAG of the table. Will make this table selectable

*/
aprovapp.directive('selectableRow', function() {

    return {
        
        controller: function($scope, $element, $attrs) {
            return {
                checkRow: function(id) {
                    $element.addClass('selected');
                    var deregister;
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
                    console.log($scope);
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
                
                var el = $(this);
                var chkbox = el.find('input[type=checkbox]:first');
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


/**

@directive selectCheckbox

Directive for the INPUT CHECKBOX TAG that represents the object ID and is
auxiliary for the object selection

*/
aprovapp.directive('selectCheckbox', function() {
    return {
        link: function(scope, element, attr, selectable_ctrl) {
            element.bind('click', function(e) {
                var el;
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


/**

@directive selectCheckbox

Directive for the A TAG that will fire the removal of the objects selected

*/
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









































