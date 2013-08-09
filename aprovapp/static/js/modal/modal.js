
var dontTouchDirective = function() {
    return {
        
        replace: true,
        
        template: '<div id="overlay" ng-click="onClick()" ng-controller="dontTouchCtrl">',
        
        link: function(scope, element, attributes) {

            element = $(element[0]);            

            var getDocHeight = function() {
                var body = document.body;
                var html = document.documentElement;
                return Math.max(body.scrollHeight, body.offsetHeight, 
                                html.clientHeight, html.scrollHeight, html.offsetHeight);
            }

            $(window).bind('resize', function() {
                element.css('height', getDocHeight());
                console.log('Resizee');
            });

            alert('nicuri');

            css = {
                'display': 'none',
                'opacity': scope.opacity,
                'background-color': scope.color,
                'position':'absolute',
                'width':'100%',
                'height': getDocHeight(),
                'top':'0',
                'left':'0',
                'z-index':1000
            }

            $(document).keyup(function(e) {
                if (e.keyCode == 27) { 
                    scope.onClick();
                    scope.$apply();
                }
            });

            element.css(css);

            var opts = {
              lines: 13, // The number of lines to draw
              length: 19, // The length of each line
              width: 7, // The line thickness
              radius: 41, // The radius of the inner circle
              corners: 1, // Corner roundness (0..1)
              rotate: 32, // The rotation offset
              direction: 1, // 1: clockwise, -1: counterclockwise
              color: scope.spinnerColor, // #rgb or #rrggbb
              speed: 1, // Rounds per second
              trail: 24, // Afterglow percentage
              shadow: false, // Whether to render a shadow
              hwaccel: false, // Whether to use hardware acceleration
              className: 'spinner', // The CSS class to assign to the spinner
              zIndex: 2e9, // The z-index (defaults to 2000000000)
              top: 'auto', // Top position relative to parent in px
              left: 'auto' // Left position relative to parent in px
            };

            var spinner = new Spinner(opts).spin();
            element.append(spinner.el);

            scope.$watch('toggle_spinner',
                function(toggle_spinner) {

                    if(!toggle_spinner) {
                        spinner.stop();
                    } else {
                        opts.color = scope.spinnerColor;
                        spinner = new Spinner(opts).spin();
                        element.append(spinner.el);
                    }

                }
            );

            scope.$watch(
                'toggle',
                function(value) {

                    var prop = {}
                    display = '';

                    if(value) {

                        display = 'block';
                        prop = {
                            'background-color': scope.color,
                            'opacity': scope.opacity
                        };

                        scope.toggle_spinner = scope.spinner;

                    } else {

                        display = 'none';
                        prop = {
                            'opacity': 0
                        };
                        spinner.stop();
                    }

                    if(typeof(element.animate) === 'function'  && scope.animate) {
                        if(value) {
                            element.css('display', 'block');
                            element.animate(prop, 'fast', 'swing', function() {
                                element.css('display', 'block');
                            });
                        } else {
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

            scope.$watch(
                'resize_trigger',
                function(val) {
                    element.css('height', getDocHeight());
                }
            );


        }
    }
}




var DontTouchCtrl = function($scope, dontTouchService, modalService) {

    $scope.defaults = {
        toggle : false,
        block : false,
        animate : true,
        spinner : false,
        color: 'black',
        spinnerColor: 'white',
        opacity: 0.8,
        resize_trigger: 0
    }

    $scope.loadProperies = function(prop) {
        for(p in prop) $scope[p] = prop[p];
    }

    $scope.loadProperies($scope.defaults);

    $scope.on = function(prop) {
        $scope.loadProperies(prop);
        $scope.toggle = true;
    }

    $scope.off = function() {
        $scope.toggle = false;
        $scope.block = false;
        $scope.loadProperies($scope.defaults);
    }

    $scope.onClick = function() {
        if(!$scope.block) {
            $scope.off();
            modalService.dismiss();
        }
    }

    dontTouchService.init($scope);
}




var dontTouchService = function($timeout) {

    var dt = {}

    dt.off_callback = function() {};

    dt.init = function(scope) {
        this.scope = scope;
    }

    dt.on = function(prop, off_callback) {
        this.scope.on(prop);
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

    dt.toggle_spinner = function() {
        if(this.scope.spinner) this.scope.toggle_spinner = !this.scope.toggle_spinner;
    }

    dt.resize = function() {
        this.scope.resize_trigger++;
    }

    return dt;

}


function registerDontTouch(module) {
    module.factory('dontTouchService', ['$timeout', dontTouchService]);
    module.controller('dontTouchCtrl', ['$scope', 'dontTouchService', 'modalService', DontTouchCtrl]);
    module.directive('dontTouch', dontTouchDirective);
}










































var modalDirective = function($timeout, dontTouchService) {
    
    return {
        replace: true,
        template:   '<div id="modal-box" class="reveal-modal {{ size }}" ng-controller="ModalCtrl">'
                  + '<h2 ng-show="title.length">{{ title }}</h2>'
                  + '<p class="lead" ng-show="lead.length">{{ lead }}</p>'
                  + '<p ng-show="txt.length">{{ txt }}</p>'
                  + '<img id="modal-img" ng-show="img.length" ng-src="{{ img }}" image-load>{{ txt }}</p>'
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
            
            var prop = {
                'display': 'block',
                'visibility': 'visible',
                'opacity': 0,
                'z-index': 1001
            }

            element.css(prop);
            element.data('visible', true);
            
            $scope.loadDefaults();

            $scope.default_top = parseInt(element.css('top'),10);

            // Watch for visible property changes
            $scope.$watch('[visible, img_loaded, img]', function(value) {

                    var is_visible = value[0];
                    var is_loaded = value[1];
                    var has_image = value[2].length;
                    var complete = $('#modal-img')[0].complete;

                    var top = 0;
                    var opacity;
                    var status_changed = false;

                    if ((is_visible && has_image && (is_loaded||complete)) || (is_visible && !has_image && !is_loaded) ) {
                        //show
                        $scope.start_scroll = $(window).scrollTop();
                        top = ($scope.default_top + $scope.start_scroll);
                        opacity = 1;
                        
                        if($scope.size == 'fullscreen') {
                            window.scrollTo(0,0);
                            top = 0;
                        }

                        dontTouchService.toggle_spinner();

                        element.data('visible',true);
                        var status_changed = true;                 
                    
                    } else if(!is_visible && element.data('visible')) {
                        console.log('I HIDE');
                        //hide 

                        element.data('visible', false);

                        top = -(element.height() + $scope.default_top + 10);
                        opacity = 0;

                        //Reset Mobile browsers viewport/pinch zoom
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
                            window.scrollTo(0,$scope.start_scroll);
                        }
                        var status_changed = true;
                    }


                    if(status_changed) {

                        var prop = {
                            'top' : top,
                            'opacity' : opacity
                        }

                        if($scope.size == 'fullscreen') {
                            prop['border'] = 0;
                            prop['box-shadow'] = 'none';
                        } else {
                            prop['border'] = '1px solid rgb(102, 102, 102)';
                            prop['box-shadow'] = '0px 0px 10px rgba(0, 0, 0, 0.4)';
                        }

                        if(typeof(element.animate) === 'function'  && $scope.animate) {
                            element.animate(prop, 250, 'swing', function() {
                                $timeout(function() {
                                    dontTouchService.resize();
                                }, 1);
                            });
                        } else {
                            element.css(prop);
                        }

                    }

                }, true
            );
        }
    }
}


var imageLoadDirective = function() {
    return {
        link: function(scope, element, attrs) {   

            $(element[0]).on("load" , function(e){ 

                scope.img_loaded = true;
                scope.$apply();

            });
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
    $scope.img_loaded = false;

    $scope.size = "";

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
        size: '',
        img: '',
        img_loaded: false,
        spinner: false,
        spinnerColor: 'white',
        overlayColor: 'black',
        overlayOpacity: 0.8,
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

            console.log($scope.overlayColor);

            // Turn on background overlay
            dontTouchService.on({
                block: block,
                animate: $scope.animate,
                
                spinner: $scope.spinner,
                spinnerColor: $scope.spinnerColor,
                color: $scope.overlayColor,
                opacity: $scope.overlayOpacity
            
            }, function() {
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




var modalService = function() {

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
    module.factory('modalService', modalService);
    module.controller('ModalCtrl', ['$scope', '$timeout', 'stateManager', 'modalService', 'dontTouchService', ModalCtrl]);
    module.directive('modal', ['$timeout', 'dontTouchService', modalDirective]); 
    module.directive('imageLoad', imageLoadDirective);  
}