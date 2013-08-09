


var fisherYates = function( myArray ) {
    var i = myArray.length, j, temp;
    if ( i === 0 ) return false;
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = myArray[i];
        myArray[i] = myArray[j]; 
        myArray[j] = temp;
    }
}




var highlightDirective = function($timeout) {
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
}

























var QuestionCtrl = function($scope, $timeout, modalService) {
    
    $scope.enunciation = 'Com fundamento na Lei no 6.745, de 28 de dezembro de 1985, que estabelece o Estatuto dos Servidores Públicos Civis do Estado de Santa Catarina, assinale a alternativa correta.';
    $scope.choices = [
        { id: 123, text: 'A readaptação de funcionário poderá acarretar decesso ou aumento de remuneração.', selected: false, wrong: false},
        { id: 456, text: 'O treinamento constitui atividade excepcional nos cargos públicos estaduais.', selected: false, wrong: false },
        { id: 789, text: 'Considera-se trabalho noturno, para os fns deste Estatuto, o prestado entre 22 (vinte e duas) horas e 05 (cinco) horas do dia seguinte.', selected: false, wrong: false },
        { id: 901, text: 'O funcionário gozará obrigatoriamente 30 (trinta) dias ininterruptos de férias por ano, de acordo com a escala organizada.', selected: false, wrong: false },
        { id: 234, text: 'Estabilidade é o direito que adquire o funcionário nomeado por concurso de não ser afastado do serviço público ou do cargo ocupado', selected: false, wrong: false }
    ];

    fisherYates($scope.choices); 

    $scope.max_selection = Math.ceil($scope.choices.length/2);
    $scope.wrong_trigger = $scope.choices.length - $scope.max_selection;

    $scope.answer_button_text = '';
    $scope.answer_button_disabled = '';
    $scope.help_text_1 = '';
    $scope.help_text_2 = '';

    $scope.answer_mode = 1;
    $scope.click_right = 'disabled';
    $scope.click_wrong = '';

    $scope.kick_mode = false;

    $scope.selected = 0;
    $scope.wrong_selected = 0;

    $scope.animate = (Modernizr.touch) ? false : true;

    $scope.answered = false;
    $scope.answer_score = 0;
    $scope.answer = {};
    $scope.right_answer = -1;
    $scope.is_right = false;

    $scope.pre_answer_area = true;
    $scope.answering_area = false;
    $scope.post_anwer_area = false;




    $scope.submitAnswer = function() {
        
        // only submit if something is selected
        if($scope.selected < 1) return;

        // Change what is show
        $scope.pre_answer_area = false;
        $scope.post_answer_area = false;
        $scope.answering_area = true;

        // send the message via $http
        // mocking with $timout
        $timeout(function() {

            // action on success

            $scope.right_answer = 1;

            var selected = $scope.getAnswer();

            $scope.reset();

            for(c in $scope.answer) {
                if($scope.answer[c] && c == $scope.right_answer) {
                    $scope.is_right = true;
                    $scope.answer_score = 1/selected;
                }
            }

            if($scope.answer_score == 0) {

                $scope.pre_answer_area = false;
                $scope.answering_area = false;
                $scope.right_answer_area = false;
                $scope.doubt_answer_area = false;
                $scope.wrong_answer_area = true;

                $scope.answer_score = 1;

            } else if($scope.answer_score < 1) {

                $scope.pre_answer_area = false;
                $scope.answering_area = false;
                $scope.right_answer_area = false;
                $scope.doubt_answer_area = true;
                $scope.wrong_answer_area = false;

            } else {
             
                $scope.pre_answer_area = false;
                $scope.answering_area = false;
                $scope.right_answer_area = true;
                $scope.doubt_answer_area = false;
                $scope.wrong_answer_area = false;

            }

            $scope.answered = true;

        }, 2000);

        var in_case_of_error = function() {

            $scope.answered = false;

        }
    }

    $scope.choiceLetter = function(code) {
        code = parseInt(code);
        code = code + 97;
        return String.fromCharCode(code);
    }

    $scope.changeMode = function(enable) {       
        $scope.answer_mode = ($scope.answer_mode == 1) ? 0 : 1;
    }

    $scope.getAnswer = function() {
        var answer = [];
        var selected = 0;
        for(c in $scope.choices) {
            var choice = $scope.choices[c];
            if(choice.selected) {
                answer[c] = true;
                selected += 1;
            }
            else answer[c] = false;
        }
        $scope.answer = answer;
        return selected;
    }

    $scope.select = function(id) {

        if($scope.answered) return;

        if($scope.kick_mode) {
            $scope.addChoice(id);
            $scope.submitAnswer();
            return;
        }

        if($scope.answer_mode == 1) {
            if($scope.choices[id].selected) $scope.removeChoice(id);
            else $scope.addChoice(id);
        }
        else
        {
            if($scope.choices[id].wrong) $scope.removeWrong(id);
            else $scope.addWrong(id);
        }
    }

    $scope.addChoice = function(id) {
        if(!$scope.choices[id].selected) {
            if($scope.answer_mode == 1) {
                if($scope.selected < $scope.max_selection) {
                    $scope.selected += 1;
                    $scope.choices[id].selected = true;
                }   
            } else {
                if(!$scope.choices[id].wrong) {
                    $scope.selected += 1;
                    $scope.choices[id].selected = true;
                }
            }
        }
    }

    $scope.removeChoice = function(id) {
        if($scope.choices[id].selected) {
            $scope.selected -= 1;
            $scope.choices[id].selected = false;
        }
    }

    $scope.addWrong = function(id) {
        if($scope.wrong_selected < $scope.choices.length-1) {
            $scope.choices[id].wrong = true;
            $scope.wrong_selected += 1;
            $scope.removeChoice(id);
        }
    }

    $scope.removeWrong = function(id) {
        $scope.choices[id].wrong = false;
        $scope.wrong_selected -= 1;
    }


    $scope.getSelected = function() {
        var selected = [];
        for(c in $scope.choices) {
            if($scope.choices[c].selected) {
                selected.push(c);
            }
        }
        return selected;
    }


    $scope.reset = function() {
        for(c in $scope.choices) {
            $scope.choices[c].selected = false;
            $scope.choices[c].wrong = false;
        }
        $scope.selected = 0;
        $scope.wrong_selected = 0;
    }

    $scope.restart = function() {
        
        $scope.reset();

        $scope.pre_answer_area = true;
        $scope.answering_area = false;
        $scope.right_answer_area = false;
        $scope.doubt_answer_area = false;
        $scope.wrong_answer_area = false;

        $scope.answered = false;
        $scope.answer_score = 0;
        $scope.answer = {};
        $scope.right_answer = -1;
        $scope.is_right = false;

        $scope.kick_mode = false;

    }

    $scope.kickMode = function() {
        $scope.kick_mode = ($scope.kick_mode) ? false : true;
        $scope.reset();
    }

    $scope.$watch('answer_mode', function() {
        $scope.kick_mode = false;
        $scope.reset();
        if($scope.answer_mode == 1) {
            $scope.click_right = 'primary-dark';
            $scope.click_wrong = 'inverse';
        } else {
            $scope.click_right = 'inverse';
            $scope.click_wrong = 'primvary-dark';
        }
    });


    $scope.$watch('wrong_selected', function() {
        var fn = ($scope.wrong_selected < $scope.wrong_trigger) ? $scope.removeChoice : $scope.addChoice;
        for(c in $scope.choices) {
            fn(c);
        }
        $scope.updateText();
    });

    $scope.$watch('selected', function() {
        $scope.updateText();
    });




    $scope.showScore = function() {
        return ($scope.answer_score*100).toFixed(1);
    }

    $scope.updateText = function() {

        var selected = $scope.getSelected();

        if($scope.selected == 0) {

            $scope.answer_button_text = "Escolha a alternativa correta";
            $scope.answer_button_disabled = "secondary disabled";
            $scope.help_text_1 = 'Marque uma alternativa, se tiver certeza, ou mais de uma se estiver em dúvida.';

        } else if($scope.selected == 1) {

            $scope.answer_button_text = "Responder com certeza";
            $scope.answer_button_disabled = 'success';
            $scope.help_text_1 = 'Se estiver certa você leva todos os pontos desta questão!';

        } else if($scope.selected > 1) {

            $scope.answer_button_text = "Responder em dúvida entre " + $scope.selected;
            $scope.answer_button_disabled = 'primary';
            
            $scope.help_text_1 = 'Se uma das escolhidas for a correta, isso conta pontos para você.';

        }
    }

    $scope.showReference = function() {

        if(Modernizr.mq('only all and (max-width: 768px)')) {

            modalService.alert({
                block: false,
                title: "",
                lead: "",
                txt: "",
                confirm_caption: "CLOSE",
                img: 'http://placehold.it/1024x2048',
                size: "fullscreen", 
                spinner: true,
                spinnerColor: 'black',
                overlayColor: 'white',
                overlayOpacity: 1
            });

        } else {

            modalService.alert({
                block: false,
                title: "",
                lead: "",
                txt: "",
                confirm_caption: "CLOSE",
                img: 'http://placehold.it/1024x2048',
                spinner: true,
            });

        }
    }

}










function registerQuestion(module) {
    module.controller('QuestionCtrl', ['$scope','$timeout', 'modalService', QuestionCtrl]);
    module.directive('highlight', highlightDirective);
}