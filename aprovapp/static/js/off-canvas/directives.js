//
// Infinite Canvas Container
//
offCanvasModule.directive('infiniteCanvas', ['$timeout', function($timeout) {
    return {

        link: function($scope, $element, $attributes) {

            var q;

            // http://javascript.info/tutorial/animation
            var animate = function(opts) {
              var start = new Date;
              var id = setInterval(function() {
                var timePassed = new Date - start;
                var progress = timePassed / opts.duration;
                if (progress > 1) progress = 1;
                var delta = opts.delta(progress);
                opts.step(delta);
                if (progress == 1) {
                  clearInterval(id);
                  opts.finish();
                }
              }, opts.delay || 10);
              return id;
            }


            var setActualScrollPosition = function() {
                // Obtem a posição atual do scroll horizontal
                var w = (typeof(window.pageXOffset) == 'number') ?
                    window.pageXOffset : document.body.scrollLeft;

                var h = (typeof(window.pageYOffset) == 'number') ?
                    window.pageYOffset : document.body.scrollTop;

                var vp_scale = getViewportScale();

                $scope.setScrollPosition(w, h, vp_scale);

            }

            var setScreenSizes = function () {
                // Calcula formula de casas baseado no W x H atual
                // Salva formula no scope
                
                var body = document.body;
                var html = document.documentElement;
                
                var sizes = {
                    'view_w' : html.clientWidth,
                    'view_h' : html.clientHeight,
                    'doc_w' : Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
                    'doc_h': Math.max(body.scrollWidth, body.offsetWidth, html.scrollWidth, html.offsetWidth, html.clientWidth)
                };


                $scope.setScreenSizes(sizes);

            }

            var getViewportScale = function() {

                if(Modernizr.touch) {

                    var visual_vp = window.innerWidth;
                    var layout_vp = document.documentElement.clientWidth;

                    // Calculate viewport scale
                    var viewport_scale = layout_vp / visual_vp;

                    if(isNaN(viewport_scale)) viewport_scale = 1;

                } else {
                    var viewport_scale = 1;
                }

                return viewport_scale;

            }

            var updatePostition = function() {

                    // Atualiza scroll position
                    setActualScrollPosition();
                    setScreenSizes();

                    $scope.updatePosition();

            };

            var stopAnimation = function() {
                if(angular.isDefined($scope.anima_id)) {
                    clearInterval($scope.anima_id);
                    $scope.moving = false;
                    setActualScrollPosition();
                }
            };


            // Monitora mudanças de posição e faz o scroll automatico
            $scope.$on('move', function(e, cause) {

                var ini_pos = $scope.scroll_w;
                var go_to_pos = $scope.scroll_position;
                var delta = go_to_pos - ini_pos;

                if(ini_pos == go_to_pos || isNaN(ini_pos) || isNaN(go_to_pos)) return;

                //var vp_scale = getViewportScale();
                //if(vp_scale != 1) return;
                if(($scope.viewport_scale > 1.2 || $scope.viewport_scale < 0.8) && cause == 'update') return;


                if(cause == 'resize') {
                    // Dont animate
                    window.scrollTo(go_to_pos, $scope.scroll_h);

                } else {

                    var big = Math.max(ini_pos, go_to_pos);
                    var small = Math.min(ini_pos, go_to_pos);

                    var max_dur = 1000;
                    var dur_rate = (big-small)/$scope.view_port;
                    var duration = max_dur * dur_rate;

                    var e_in = function(p) { return 1 - Math.sin(Math.acos(p)); }
                    var makeEOut = function(d) { 
                        return function(p) {
                            return 1 - d(1-p);
                        };
                    };

                    var easing = makeEOut(e_in);
                    if(Modernizr.touch) {
                        duration = max_dur;
                        //easing = e_in;
                    }

                    // Set moving state
                    $scope.moving = true;

                    $scope.anima_id = animate({
                        delay: 10,
                        duration: duration, 
                        delta: easing,
                        step: function(rate) {

                          // Define steps de animação
                          var step = (ini_pos < go_to_pos) ?
                            ini_pos + (delta * rate) :
                            go_to_pos - (delta * (1-rate));

                          // Executa o passo
                          window.scrollTo(step, $scope.scroll_h); 
                        
                        },
                        finish: function() {
                            setActualScrollPosition();
                            $timeout(function() {
                                $scope.moving = false;
                                $scope.scrolling = false;
                            }, 0);
                        }
                    });

                }

            });


            $(window).on('touchstart', function() {
                $scope.imHere();
                // Para animação
                stopAnimation();
            });

            $(document).on('mousemove', function(e) {
                $scope.imHere();
                if(!('__proto__' in {})) {
                    // for IE only, because it dont have mouseup
                    if($scope.scrolling && $scope.mouse_down) {
                        setActualScrollPosition();
                        $scope.definePointer();
                        $scope.scrolling = false;
                    }   
                }
            });

            $(window).on('mousedown', function() {
                $scope.imHere();
                // Altera o Estado do usuário no scope
                // Avisa que ele está clicou o mouse
                
                // Para animação
                stopAnimation();

                $scope.mouse_down = true;

            });


            $(window).on('mouseup', function() {
                $scope.imHere();
                // Altera o Estado do usuário no scope
                // Avisa que ele largou o mouse

                $scope.mouse_down = false;

                if($scope.scrolling) {
                    setActualScrollPosition();
                    $scope.definePointer();
                    $scope.scrolling = false;
                }
            });
            


            $(window).on('scroll', function(e) {
                $scope.imHere();
                // Monitora o scroll com um timeout
                // E pede update da localização

                if(!$scope.scrolling)  $scope.scrolling = true;

                // If is moving, don't need to do nothing
                if($scope.moving || $scope.mouse_down) {
                    return;
                }

                $timeout.cancel(q);

                var speed = 500;
                q = $timeout(function() {
                    setActualScrollPosition();
                    $scope.definePointer();
                    $scope.scrolling = false;
                }, speed);

            });


            $(window).on('resize', function() {

                $scope.imHere();
                // Stop moving animation
                if($scope.moving) stopAnimation();
                // Set screen sizes
                setScreenSizes();
                // Fix position without no animation
                $scope.goTo($scope.pointer, 'resize', true);
            });


            $(document).on('keydown', function(e){

                $scope.imHere();
                // Stop moving animation
                if($scope.moving) stopAnimation();
                // Key actions translated to goTo parameters
                var keys = {
                    37 : 'prev',
                    39 : 'next',
                    35 : 'last',
                    36 : 'first'
                }
                // Execute key comand
                var code = e.keyCode;
                if(keys[e.keyCode]) {
                    $scope.goTo(keys[e.keyCode], 'keys', false);
                    e.preventDefault();            
                }
            });

            $scope.$on('modalhide', function() {
                window.scrollTo($scope.scroll_position, 0);
            });

            // FIRST SCREEN SIZE LOADING
            $timeout(setScreenSizes, 500);

        }

    }
}]);

//
// Static navigation bar
//
offCanvasModule.directive('staticRow', ['$timeout', function($timeout) {
    return {
        link: function($scope, $element, $attributes) {
            var el = $($element[0]);
            // Listen to MOVE event
            $scope.$on('move', function() {
                // Actualize staticRow position
                el.css('left', $scope.scroll_position);
            });
        }
    }
}]);


offCanvasModule.directive('staticRowBackground', [function() {
    return {
        link: function($scope, $element, $attributes) {
            var el = $($element[0]);
            $scope.$on('resize', function(e) {
                el.css('width', $scope.view_port * $scope.data_length);
            });
        }
    }
}]);


offCanvasModule.directive('goTo', ['$timeout', function($timeout) {
    return {
        link: function($scope, $element, $attributes) {
            
            var el = $($element[0]);

            // Listen to scroll events
            
            el.on('focus', function(e) {
                e.preventDefault();
                $scope.monitor_click = false;
            });

            el.on('blur', function(e) {
                
                e.preventDefault();

                var val = el[0].value;

                if(isNaN(val)) {
                    val = $scope.pointer + 1;
                    el[0].value = val;
                }

                if(val != $scope.pointer + 1) {
                    $scope.goTo(parseInt(val-1), 'input', false);
                }

            });

            $scope.$watch('pointer', function() {
                el[0].value = $scope.pointer + 1;
            });
        }
    }
}]);


//
//  Items in the Infinite Canvas
//
offCanvasModule.directive('infiniteItem', [function() {
    return {

        link: function($scope, $element, $attributes) {

            var element = $($element[0]);
            var factor = 1;

            // Position itself in the infiniteCanvas
            var number = $attributes.infiniteItem;
            var margin_left = number * factor * 100;
            element.css('left', margin_left + '%');

        }

    }
}]);