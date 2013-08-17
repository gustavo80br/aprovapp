modalModule.directive('dontTouch', function() {

    return {
        
        replace: true,
        
        template: '<div id="overlay" ng-click="onClick()" ng-controller="dontTouchCtrl"><div id="overlay-spinner"></div>',
        
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
            });

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

            /*console.log('chupeta na manteiga');
            $(spinner.el).css({
                top: document.documentElement.clientHeight/2,
                left: document.documentElement.clientWidth/2
            });*/

            element.append(spinner.el);

            var toggleSpinner = function(toggler) {
                if(!toggler) {
                    console.log('toggle_spinner FALSE');
                    spinner.stop();
                } else {
                    opts.color = scope.spinnerColor;
                    spinner = new Spinner(opts).spin();
                    
                    console.log('toggle_spinner TRUE');
                    $(spinner.el).css({
                        position: 'absolute',
                        top: document.documentElement.clientHeight/2,
                        left: document.documentElement.clientWidth/2
                    });

                    element.append(spinner.el);
                }
            }

            scope.$watch('toggle_spinner', toggleSpinner);

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
                        /*if(scope.spinner) {
                            toggleSpinner(scope.spinner);
                        }*/

                    } else {

                        display = 'none';
                        prop = {
                            'opacity': 0
                        };
                        spinner.stop();
                        scope.toggle_spinner = false;
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
})


modalModule.directive('modal', ['$timeout', 'dontTouchService', function($timeout, dontTouchService) {
    
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
}])


modalModule.directive('imageLoad', function() {  
    return {
        link: function(scope, element, attrs) {   

            $(element[0]).on("load" , function(e){ 

                scope.img_loaded = true;
                scope.$apply();

            });
        }
    }
})
