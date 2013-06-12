
var dontTouchDirective = function() {
    return {
        
        replace: true,
        
        template: '<div dont-touch-toggler="toggler" ng-click="onClick()" ng-controller="dontTouchCtrl">',
        
        link: function(scope, element, attributes) {
            
            console.log('e o dont touch mano');
            console.log(element);

            element = $(element[0]);

            css = {
                'display': 'none',
                'opacity': 0.8,
                'background-color':'#000',
                'position':'fixed',
                'width':'100%',
                'height':'100%',
                'top':'0px',
                'left':'0px',
                'z-index':1000
            }

            element.css(css);

            scope.$watch(
                'toggler',
                function(value) {

                    var prop = {}
                    display = '';

                    if(value) {
                        display = 'block';
                        prop = {
                            'opacity': 0.8
                        };
                    } else {
                        display = 'none';
                        prop = {
                            'opacity': 0
                        };
                    }

                    if(typeof(element.animate) === 'function') {
                        if(value) {
                            console.log('in');
                            element.css('display', 'block');
                            element.animate(prop, 'fast', 'swing', function() {
                                element.css('display', 'block');
                            });
                        } else {
                            console.log('out');
                            element.animate(prop, 'fast', 'swing', function() {
                                element.css('display', 'none');
                            });
                        }
                    } else {
                        element.css(prop);
                        element.css('display', display);
                    }

                }
            );
        }
    }
}

var DontTouchCtrl = function($scope, dontTouchService) {
    
    $scope.toggler = false;
    $scope.click_turn_off = true;

    $scope.on = function() {
        $scope.toggler = true;
    }

    $scope.off = function() {
        $scope.toggler = false;
    }

    $scope.onClick = function() {
        if($scope.click_turn_off) {
            $scope.off();
        }
    }

    dontTouchService.init($scope);
}


var dontTouchService = function() {

    var dt = {}

    dt.init = function(scpe) {
        this.scope = scpe;
    }

    dt.on = function() {
        this.scope.on();
    }

    dt.off = function() {
        this.scope.off();
    }

    return dt;

}


function registerDontTouch(module) {
    module.factory('dontTouchService', dontTouchService);
    module.controller('dontTouchCtrl', ['$scope', 'dontTouchService', DontTouchCtrl]);
    module.directive('dontTouch', dontTouchDirective);
}





















var modalDirective = function() {
    return {
        replace: true,
        template:   '<div id="modal-box" class="reveal-modal" modal-toggler="visible" ng-controller="ModalCtrl">'
                  + '<h2 ng-show="title.length">{{ title }}</h2>'
                  + '<p class="lead" ng-show="lead.length">{{ lead }}</p>'
                  + '<p ng-show="txt.length">{{ txt }}</p>'
                  + '<a class="close-reveal-modal" ng-click="close()">x</a>'
                  + '<div ng-show="showButtons()">'
                  + '<a href="#" class="button small" ng-click="okAction()" ng-show="ok_btn">{{ ok_caption }}</a>'
                  + '<a href="#" class="button small" ng-click="customAction()" ng-show="action_btn">{{ action_caption }}</a>'
                  + '<a href="#" class="button small" ng-click="cancelAction()" ng-show="cancel_btn">{{ cancel_caption }}</a>'
                  + '</div></div>',
        link: function(scope, element, attributes) {
            element = $(element[0]);
            element.css({
                'display' : 'block',
                'visibility' : 'visible',
                'opacity' : 0,
                'z-index' : 1001,
            });
            scope.default_top = parseInt(element.css('top'),10);
        }
    }
}

var modalTogglerDirective = function(dontTouchService) {
    return {
        link: function($scope, element, attributes) {
            
            // Thanks Mr. Ben Nadel!
            // http://www.bennadel.com/blog/2440-Creating-A-Custom-Show-Hide-Directive-In-AngularJS.htm
            
            element = $(element[0]);

            $scope.$watch(
                'visible',
                function(value) {

                    var top = 0;
                    var opacity = 0;

                    if (value) {
                        //show

                        dontTouchService.on();

                        top = ($scope.default_top + $(window).scrollTop());
                        opacity = 1;

                    } else {
                        //hide 

                        dontTouchService.off();
                        
                        top = -(element.height() + $scope.default_top + 10);
                        opacity = 0;

                    }

                    var prop = {
                        'top' : top,
                        'opacity' : opacity
                    }

                    if(typeof(element.animate) === 'function') {

                        element.animate(prop, 'swing', 250);

                    } else {
                        element.css(prop);
                    }

                }
            );
        }
    }
}



var ModalCtrl = function($scope, modalService) {

    $scope.title = 'asdsadsadsa';
    $scope.lead = 'dasdasdsa';
    $scope.txt = 'sadsadsa';
    
    $scope.visible = false;

    $scope.ok_btn = false;
    $scope.cancel_btn = false;
    $scope.action_btn = false;

    $scope.ok_caption = 'OK';
    $scope.cancel_caption = 'NO';
    $scope.action_caption = 'ACTION';

    $scope.default_top = 0;

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
        $scope.visible = false;
    };

    modalService.init($scope);
}




var modalService = function() {

    var m = {};

    m.init = function(scope) {
        this.scope = scope;
    }

    m.alert = function(title, lead, content) {
        // For alert, no need buttons
        this.scope.hideButtons();

        // Show the box
        //this._open();
        this.scope.visible = ! this.scope.visible;

    }

    m.dismiss = function() {
        this.scope.visible = false;
    }

    return m;
}


function registerModal(module) {
    module.factory('modalService', modalService);
    module.controller('ModalCtrl', ['$scope', 'modalService', ModalCtrl]);
    module.directive('modal', modalDirective);
    module.directive('modalToggler', ['dontTouchService', modalTogglerDirective]);
}