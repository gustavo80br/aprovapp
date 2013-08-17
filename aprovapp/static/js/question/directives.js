questionModule.directive('questionTemplate', function() {
    return {
        templateUrl: '/static/js/question/template.html',
        replace: true
    }
});


questionModule.directive('highlight', ['$timeout', function($timeout) {
    return {
        link: function(scope, element, attributes) {

            // Instantiate basic variables
            var el = $(element[0]);
            var id = attributes.highlight;

            //CSS
            var padding = 0.4;
            var side_padding = 2;

            var normal_text_color = '#333';
            var wrong_text_color = '#999';
            var sure_background = '#CFC';
            var doubt_background = '#CDE5F4';


            // Store states CSS
            el.data('css-unchecked', {
                padding : padding + 'em',
                paddingRight: side_padding + 'em',
                background: 'transparent',
                border: '1px solid transparent',
                color: normal_text_color,
                textDecoration: 'none'
            });


            el.data('css-hover', {
                background: '#FFF'
            });


            el.data('css-hover-out', {
                background: 'transparent'
            });


            el.data('css-sure', {
                paddingRight: padding + 'em',
                paddingLeft: side_padding + 'em',
                background: sure_background,
                color: normal_text_color,
                textDecoration: 'none'
            });


            el.data('css-doubt', {
                paddingRight: padding + 'em',
                paddingLeft: side_padding + 'em',
                background: doubt_background,
                color: normal_text_color,
                textDecoration: 'none'
            });


            el.data('css-wrong', {
                textDecoration: 'line-through',
                color: wrong_text_color,
                background: 'transparent'
            });

            el.data('css-error', {
                paddingRight: padding + 'em',
                paddingLeft: side_padding + 'em',
                background: "#FADEDA",
                color: normal_text_color,
                textDecoration: 'none'
            });

            el.data('css-not-right', {
                textDecoration: 'none',
                color: normal_text_color,
                background: 'transparent'
            });


            // Instantiate state variables
            el.data('mouse-in', false);
            el.data('selected', false);
            el.data('sure', false);
            el.data('doubt', false);
            el.data('wrong', false);

            // Setup unchecked css
            el.css(el.data('css-unchecked'));


            // Auxiliar for animation
            var animateOrDie = function(status) {
                var css_end = 'css-' + status;
                if(scope.animate && typeof(el.animate) == 'function' && Modernizr.cssanimations) {
                    var time = 'fast';
                    el.animate(el.data(css_end), time,'swing');
                } else {
                    el.css(el.data(css_end));
                }
            }

            // Bind mouseenter for hover effect
            element.bind('mouseenter', function() {
                if(!Modernizr.touch) {
                    scope.$apply(function() {
                        el.data('mouse-in', true);
                        if(el.data('wrong')) {
                            css = el.data('css-hover');
                            css.textDecoration = 'none';
                            el.css(css);
                        }
                    });
                }
            });



            // Bind mouseleave for hover effect
            element.bind('mouseleave', function() {
                if(!Modernizr.touch) {
                    scope.$apply(function() {
                        el.data('mouse-in', false);
                        if(el.data('wrong')) {
                            el.css(el.data('css-wrong'));
                        }
                    });
                }
            });     


            // Evento for the ESC key to reset question
            $(document).bind('keyup', function(e) {
                if(e.keyCode == 27 && el.data('selected')) 
                    scope.$apply(scope.reset());
            });


            scope.$watch('selected', function() {

                if(scope.answered) return;

                if(scope.choices[id].selected) {

                    if(scope.selected > 1) {
                        var typ = 'doubt';
                        var no_typ = 'sure';
                    } else {
                        var typ = 'sure';
                        var no_typ = 'doubt';
                    }

                    if(!el.data(typ)) animateOrDie(typ);
                    el.data('selected', true);
                    el.data(typ, true);
                    el.data(no_typ, false);
                }
                else if(!el.data('wrong')) {
                    el.data('selected', false);
                    animateOrDie('unchecked');
                    el.data('doubt', false);
                    el.data('sure', false);
                }
            });


            scope.$watch('wrong_selected', function() {
                if(scope.choices[id].wrong) {
                    if(!el.data('wrong')) animateOrDie('wrong');
                    el.data('wrong', true);
                }
                else {
                    el.data('wrong', false);
                    if(!el.data('selected')) animateOrDie('unchecked'); 
                }
            });

            scope.$watch('answered', function() {
                
                if(scope.answered) {

                    if(scope.right_answer == id) {
                        animateOrDie('sure');
                    } else if(scope.answer[id]) {
                        animateOrDie('error');   
                    } else {
                        animateOrDie('not-right');   
                    }

                }

            });

            scope.$watch('kick_mode', function() {

                if(scope.kick_mode) {
                    animateOrDie('error');
                } else {
                    animateOrDie('unchecked');
                }

            });


        }
    }
}]);