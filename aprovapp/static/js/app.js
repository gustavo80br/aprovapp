"use strict";

var aprovapp = angular.module('aprovapp', []);



/**

@service DONT TOUCH
==================

Service to block the user interaction

*/
var dontTouch = function() {

    var dt = {};

    dt.body = $('body');
    dt.overlay = $(document.createElement('div'));
 
    dt.opacity = 80;
    dt.color = '#000';

    dt.style_template = 'display:{{DISPLAY}}; alpha(opacity={{OPA1}});-khtml-opacity: {{OPA2}};opacity:{{OPA2}};-moz-opacity: {{OPA2}};background-color:{{BG}};position:fixed;width:100%;height:100%;top:0px;left:0px;z-index:1000;';

    dt._getStyle = function(display) {
        var opa = this.opacity/100;
        var style = this.style_template;
        style = style.replace('{{DISPLAY}}',display);
        style = style.replace('{{OPA1}}',this.opacity);
        style = style.replace('{{OPA2}}',opa);
        style = style.replace('{{OPA2}}',opa);
        style = style.replace('{{OPA2}}',opa);
        style = style.replace('{{BG}}',this.color);
        return style;
    }

    /**

    @method on

    Set the overlay on. Accept overlay opacity and color as optional arguments

    Example: on(80,'#FFF')

    Sets overlay opacity to 80% and color to white.

    */
    dt.on = function(opacity, color) {
        if(!(typeof(opacity)==='undefined')) this.opactity = opacity;
        if(!(typeof(color)==='undefined')) this.color = color;
        if(typeof this.overlay.fadeIn == 'function') {
            this.overlay.attr('style', this._getStyle('none'));
            this.overlay.fadeIn();
        } else {
            this.overlay.attr('style', this._getStyle('block'));
        }
    }

    /**

    @method off

    Turns the overlay off

    */
    dt.off = function() {
        if(typeof this.overlay.fadeOut == 'function') {
            this.overlay.fadeOut();
        } else {
            this.overlay.attr('style', 'display:none');
        }
    }

    dt.overlay.attr('style', dt._getStyle('none'));
    dt.body.append(dt.overlay);

    return dt;
}

// Import the dontTouch service to the module
aprovapp.factory('dontTouch', dontTouch);


























var modalDirective = function() {
    return {
        replace: true,
        template:   '<div id="modal-box" class="reveal-modal small" ng-show="visible" ng-controller="ModalController">'
                  + '<h2 ng-show="title.length">{{ title }}</h2>'
                  + '<p class="lead" ng-show="lead.length">{{ lead }}</p>'
                  + '<p ng-show="txt.length">{{ txt }}</p>'
                  + '<a class="close-reveal-modal" ng-click="close()">x</a>'
                  + '<div ng-show="showButtons()">'
                  + '<a href="#" class="button small" ng-click="okAction()" ng-show="ok_btn">{{ ok_caption }}</a>'
                  + '<a href="#" class="button small" ng-click="customAction()" ng-show="action_btn">{{ action_caption }}</a>'
                  + '<a href="#" class="button small" ng-click="cancelAction()" ng-show="cancel_btn">{{ cancel_caption }}</a>'
                  + '</div></div>'
    }
}


var ModalController = function($scope, modal) {

    $scope.title = '';
    $scope.lead = '';
    $scope.txt = '';
    
    $scope.visible = false;

    $scope.ok_btn = false;
    $scope.cancel = false;
    $scope.action_btn = false;

    $scope.ok_caption = 'OK';
    $scope.cancel_camption = 'NO';
    $scope.action_caption = 'ACTION';

    $scope.showButtons = function() {
        if($scope.ok_btn ||  $scope.cancel_button || $scope.action_btn) return true;
        else return false;
    };

    $scope.hideButtons = function() {
        $scope.ok_btn = false;
        $scope.cancel_btn = false;
        $scope.action_btn = false;
    }

    $scope.close = function() {
        modal.dismiss();
    };

    modal._bindScope($scope);

}


var modalService = function(dontTouch) {

    var m = {};
    
    m.modal = $('#modal-box');
 
    m.settings = {
        animation_speed : 200,
        style: {
            open : {
                'opacity' : 1,
                'visibility' : 'visible',
                'display' : 'block',
                'z-index' : 1001
            },
            close : {
                'opacity' : 0,
                'visibility' : 'visible',
                'display' : 'block',
                'z-index' : 1001
            }
        }
    }

    m.offset = 0;
    m.height = 0;
    m.top = 0;

    m.is_open = false;

    m.ok_callback = function() {};
    m.cancel_callback = function() {};
    m.action_callback = function() {};

    m._bindScope = function(scope) {
        this.scope = scope;
    }


    m.alert = function(title, lead, content, callback) {
        // For alert, no need buttons
        this.scope.hideButtons();
        // Dismiss on click anywhere
        dontTouch.overlay.bind('click', m._overlayClickCallback(this));
        // Register the dismiss callback
        this.cancel_callback = callback;
        // Show the box
        this._open();
    }


    m._overlayClickCallback = function(self) {
        return function() {
            self.dismiss();
            $(this).unbind('click');
        }
    }


    m._open = function() {

        console.log(this._getStyle('open'));
        console.log(this._getStyle('close'));

        this.in_transition = true;

        if(this.is_open) {
            this.dismiss();
            setTimeout(
                this._openTimeoutCallback(this),
                this.settings.animation_speed
            );
        } else {
            
            this.modal.addClass('open');
            dontTouch.on();
            
            if(typeof this.modal.animate == 'function') {               
                this.modal.stop().animate(this.settings.style.open,
                    this.settings.animation_speed,
                    'swing',
                    this._openCallback(this)
                );
            } else {
                this.modal.attr('style', this._getStyle('open'));
                this.is_open = true;
                this.in_transition = false;
                this.cancel_callback();
                this.cancel_callback = function() {};
            }
        }
    }


    m._openTimeoutCallback = function(self) {
        return function() {
            self._open();
        }
    }


    m._openCallback = function(self) {
        return function() {
            self.is_open = true;
            self.in_transition = false;
        }
    }

    m.dismiss = function() {
        
        this.in_transition = true;
        dontTouch.off();

        if(typeof this.modal.animate == 'function') {
            this.modal.stop().animate(this.settings.style.close,
                this.settings.animation_speed,
                'swing',
                m.dismissCallback(this));

        } else {
            this.modal.attr('style', this._getStyle('close'));
            this.is_open = false;
        }
    }


    m.dismissCallback = function(self) {
        return function() {
            self.is_open = false;
            self.in_transition = false;
        }
    }


    m._setTop = function() {
        
        this.offset = $(window).scrollTop();
        this.modal.attr('style', this._getStyle('open'));
        this.height = this.modal.height();
        this.modal.attr('style', this._getStyle('close'));

        this.top = parseInt(m.modal.css('top'),10);

        console.log(this.top);
        console.log(this.offset);
        console.log(this.height);

        this.settings.style.close['top'] = (-(this.offset + this.top + this.height)) + 'px';
        this.settings.style.open['top'] = (this.offset + this.top) + 'px';

        console.log(this.settings.style.open['top']);
        console.log(this.settings.style.close['top']);

    }


    m._getStyle = function(style) {
        var response;
        switch(style)  {
            case 'close':
                response = angular.toJson(this.settings.style.close);
                break;
            case 'open':
                response = angular.toJson(this.settings.style.open);
                break;
        }
        response = response.replace('{','');
        response = response.replace('}','');
        response = response.replace(/"/g,'');
        response = response.replace(/,/g,';');
        return response;
    }

    m._setTop();

    m.modal.attr('style', m._getStyle('close'));

    return m;
}


function registerModal(module) {
    module.factory('modal', ['dontTouch', modalService]);
    module.controller('ModalController', ['$scope', 'modal', ModalController]);
    module.directive('modalTag', modalDirective);
}

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









































