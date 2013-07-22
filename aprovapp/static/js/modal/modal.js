
var dontTouchDirective = function() {
    return {
        
        replace: true,
        
        template: '<div style="position:fixed" ng-click="onClick()" ng-controller="dontTouchCtrl">',
        
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

            $(document).keyup(function(e) {
                console.log(e.keyCode);
                if (e.keyCode == 27) { 
                    scope.onClick();
                    scope.$apply();
                }
            });

            element.css(css);

            scope.$watch(
                'toggle',
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

                    if(typeof(element.animate) === 'function'  && scope.animate) {
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

var DontTouchCtrl = function($scope, dontTouchService, modalService) {
    
    $scope.toggle = false;
    $scope.block = false;
    $scope.animate = true;

    $scope.on = function(block, animate) {
        $scope.toggle = true;
        if(block) $scope.block = true;
        if(!(typeof animate === "undefined"))
            $scope.animate = animate;
    }

    $scope.off = function() {
        $scope.toggle = false;
        $scope.block = false;
    }

    $scope.onClick = function() {
        if(!$scope.block) {
            $scope.off();
            modalService.dismiss();
        }
    }

    dontTouchService.init($scope);
}


var dontTouchService = function() {

    var dt = {}

    dt.off_callback = function() {};

    dt.init = function(scope) {
        this.scope = scope;
    }

    dt.on = function(block, animate, off_callback) {
        this.scope.on(block, animate);
        if(typeof(off_callback) === 'function') {
            this.off_calback = off_callback;
        }
    }

    dt.off = function() {
        this.scope.off();
        if(typeof(this.off_calback) === 'function') {
            this.off_callback(this);
        }
    }

    return dt;

}


function registerDontTouch(module) {
    module.factory('dontTouchService', dontTouchService);
    module.controller('dontTouchCtrl', ['$scope', 'dontTouchService', 'modalService', DontTouchCtrl]);
    module.directive('dontTouch', dontTouchDirective);
}










































var modalDirective = function(dontTouchService) {
    
    return {
        replace: true,
        template:   '<div id="modal-box" class="reveal-modal" ng-controller="ModalCtrl">'
                  + '<h2 ng-show="title.length">{{ title }}</h2>'
                  + '<p class="lead" ng-show="lead.length">{{ lead }}</p>'
                  + '<p ng-show="txt.length">{{ txt }}</p>'
                  + '<img ng-src="{{ img }}">{{ txt }}</p>'
                  + '<a class="close-reveal-modal" ng-click="dismissAction()">x</a>'
                  + '<div>'
                  + '<ul class="button-group">'
                  + '<li><a href="" class="button round small success" ng-click="confirmAction()" ng-show="confirm_btn" style="margin-right:10px">{{ confirm_caption }}</a></li>'
                  + '<li><a href="" class="button round small primary" ng-click="customAction()" ng-show="action_btn" style="margin-right:10px">{{ action_caption }}</a></li>'
                  + '<li><a href="" class="button round small alert" ng-click="dismissAction()" ng-show="dismiss_btn" style="margin-right:10px">{{ dismiss_caption }}</a></li>'
                  + '</ul>'
                  + '</div>'
                  + '</div>',
        
        link: function($scope, element, attributes) {
            
            element = $(element[0]);
            
            element.css({
                'display' : 'block',
                'visibility' : 'visible',
                'opacity' : 0,
                'z-index' : 1001,
            });
            
            $scope.loadDefaults();

            $scope.default_top = parseInt(element.css('top'),10);

            // Watch for visible property changes
            $scope.$watch('visible',function(value) {

                    var top = 0;
                    var opacity = 0;

                    if (value) {
                        //show
                        $scope.start_scroll = $(window).scrollTop();
                        top = ($scope.default_top + $scope.start_scroll);
                        opacity = 1;
                    
                    } else {
                        //hide 
                        top = -(element.height() + $scope.default_top + 10);
                        opacity = 0;

                        // Reset Mobile browsers viewport/pinch zoom
                        if(Modernizr.touch) {
                            var viewport = $('meta[name=viewport]');             
                            $timeout(function() {
                                viewport.prop('content', 'initial-scale=1.0, maximum-scale=1.0, user-scalable=1');
                            }, 300);
                            $timeout(function() {
                                viewport.prop('content', 'initial-scale=1.0, maximum-scale=10.0, user-scalable=1');
                            }, 500);
                        }

                        // Scroll back to the position before the modal open
                        if(typeof $scope.start_scroll != 'undefined') {
                            console.log('->' + $scope.start_scroll);
                            window.scrollTo(0,$scope.start_scroll);
                        }

                    }

                    var prop = {
                        'top' : top,
                        'opacity' : opacity
                    }

                    if(typeof(element.animate) === 'function'  && $scope.animate) {
                        element.animate(prop, 250, 'swing');
                    } else {
                        element.css(prop);
                    }

                }
            );
        }
    }
}




var ModalCtrl = function($scope, $timeout, stateManager, modalService, dontTouchService) {

    $scope.title = '';
    $scope.lead = '';
    $scope.txt = '';
    
    $scope.visible = false;
    $scope.animate = true;

    $scope.confirm_btn = false;
    $scope.dismiss_btn = false;
    $scope.action_btn = false;

    $scope.confirm_caption = 'OK';
    $scope.dismiss_caption = 'NO';
    $scope.action_caption = 'ACTION';

    $scope.img = "";

    $scope.onConfirm = function() { return true; }
    $scope.onDismiss = function() { return true; }
    $scope.onAction = function() { return true; }

    $scope.default_top = 0;

    $scope.defaults = {
        animate : true,
        confirm_caption : 'OK',
        dismiss_caption : 'CANCEL',
        action_caption : 'ACTION',
        title : 'Modal Box',
        lead : 'The great Modal service',
        txt : 'A true friend in all situations!',
        onConfirm : function() { return true; },
        onDismiss : function() { return true; },
        onAction : function() { return true; }
    }

    $scope.loadDefaults = function() {
        for(p in $scope.defaults) {
            if(p == 'onConfirm' || p == 'onDismiss' || p == 'onAction' ) {
                if(typeof($scope.defaults[p]) === 'function') {
                    $scope[p] = $scope.defaults[p];
                }
            } else {
                $scope[p] = $scope.defaults[p];
            }
        }
    }

    $scope.confirmAction =  function() {
        response = $scope.onConfirm($scope);
        if(response) $scope.hide();
    }

    $scope.dismissAction = function () {
        response = $scope.onDismiss($scope);
        if(response) $scope.hide();
    }

    
    $scope.customAction = function () {
        response = $scope.onAction($scope);
        if(response) $scope.hide();
    }


    $scope.showButtons = function() {
        if($scope.confirm_btn ||  $scope.dismiss_btn  || $scope.action_btn) return true;
        else return false;
    };


    $scope.hideButtons = function() {
        $scope.confirm_btn = false;
        $scope.dismiss_btn = false;
        $scope.action_btn = false;
    }


    $scope.show = function(block) {
        if(!$scope.visible) {
            
            // Set modal open state
            $scope.visible = true;
            stateManager.pushState([$scope.initial_state,"modal"]);

            // Turn on background overlay
            dontTouchService.on(block, $scope.animate, function() {
                $scope.hide();
            });
        }
    };


    $scope.hide = function() {
        if($scope.visible) {
            
            // Get out of open modal state
            $scope.visible = false;
            stateManager.replaceState([$scope.initial_state]);

            // Turn off the background overlay
            dontTouchService.off();

            // Reset modal contents, timeout wait for animation end
            $timeout(function() {
                $scope.loadDefaults();
            }, 250);
        
        }
    };


    modalService.init($scope);

    stateManager.registerInitialiser(function (pathComponents) {
        $scope.initial_state = pathComponents[0];
        if(!(pathComponents[1] == 'modal')) {
            $scope.hide();
        }
    })($scope);

}




var modalService = function($timeout) {

    var m = {};

    m.hide_before_show = false;

    m.init = function(scope) {
        this.scope = scope;
    }

    m.loadProperties = function(prop) {
        for(p in prop) {
            if(p == 'onConfirm' || p == 'onDismiss' || p == 'onAction' ) {
                if(typeof(prop[p]) === 'function') {
                    this.scope[p] = prop[p];
                }
            } else {
                this.scope[p] = prop[p];
            }
        }
    }

    m.alert = function(prop) {

        if(this.scope.visible) {
            this.scope.hide();
            $timeout(function() {
                m.alert(prop);
            }, 250);
        } else {
            this.scope.hideButtons();
            this.loadProperties(prop);
            this.scope.confirm_btn = true;
            this.scope.show(prop.block);
        }

    }

    m.confirm = function(prop) {

        // For alert, no need buttons

        // Show the box
        if(this.scope.visible) {
            this.scope.hide();
        } else {
            this.scope.hideButtons();
            this.loadProperties(prop);
            this.scope.confirm_btn = true;
            this.scope.dismiss_btn = true;
            this.scope.show(prop.block);
        }

    }

    m.dismiss = function() {
        this.scope.dismissAction();
    }

    return m;
}


function registerModal(module) {
    module.factory('modalService', ['$timeout', modalService]);
    module.controller('ModalCtrl', ['$scope', '$timeout', 'stateManager', 'modalService', 'dontTouchService', ModalCtrl]);
    module.directive('modal', modalDirective);    
}