


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
            var side_padding = 3;

            // Store states CSS
            el.data('css-unchecked', {
                padding : padding + 'em',
                border : '1px solid transparent',
                paddingRight: side_padding + 'em',
                background: 'transparent',
                color: '#000',
                textDecoration: 'none'
            }),

            el.data('css-hover', {
                background: '#FFF'
            }),

            el.data('css-hover-out', {
                background: 'transparent'
            }),

            el.data('css-sure-start', {
                border: '1px solid #060',
                paddingRight: padding + 'em',
                paddingLeft: side_padding + 'em',
                background: '#9F9',
            }),

            el.data('css-sure-end', {
                border: '1px solid transparent',
                background: '#CFC',
                color: '#000',
                textDecoration: 'none'
            }),

            el.data('css-doubt-start', {
                border: '1px solid #FB0',
                paddingLeft: side_padding + 'em',
                paddingRight: padding + 'em',
                background: '#FF0'
            }),

            el.data('css-doubt-end', {
                border: '1px solid transparent',
                paddingRight: '0em',
                background: '#FFB',
                color: '#000',
                textDecoration: 'none'
            }),

            el.data('css-wrong-start', {
                textDecoration: 'line-through',
                color: '#CCC',
                border: '1px solid #F00',
                background: '#F00'
            }),

            el.data('css-wrong-end', {
                textDecoration: 'line-through',
                color: '#CCC',
                border: '1px solid transparent',
                background: 'transparent',
            }),

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
                var css_end = 'css-' + status + '-end';
                var css_start = 'css-' + status + '-start';
                if(scope.animate && typeof(el.animate) === 'function') {
                    var time = 200;
                    if(!(status == 'unchecked')) {
                        el.css(el.data(css_start));
                        var time = 1000;
                    } else {
                        css_end = 'css-unchecked';
                    }
                    el.animate(el.data(css_end),time,'swing');
                } else {
                    if(status == 'unchecked') css_end = 'css-unchecked';
                    el.css(el.data(css_end));
                }
            }

            // Bind mouseenter for hover effect
            element.bind('mouseenter', function() {
                scope.$apply(function() {
                    el.data('mouse-in', true);
                    if(!(el.data('selected') || el.data('wrong'))) {
                        el.css(el.data('css-hover'));
                    }
                });
            });


            // Bind mouseleave for hover effect
            element.bind('mouseleave', function() {
                scope.$apply(function() {
                    el.data('mouse-in', false);
                    if(!(el.data('selected') || el.data('wrong'))) {
                        animateOrDie('unchecked');
                    }
                });
            });     


            // Evento for the ESC key to reset question
            $(document).bind('keyup', function(e) {
                if(e.keyCode == 27 && el.data('selected')) 
                    scope.$apply(scope.reset());
            });


            // Reset question if answer mode changes
            scope.$watch('answer_mode', function() {
                el.trigger('clearSelection');
            });


            scope.$watch('selected', function() {
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

            scope.$watch('kick_mode', function() {
                if(scope.kick_mode) {
                    console.log('kick man');
                    
                    var f = function() {
                        animateOrDie('doubt');
                        $timeout(function() {
                            animateOrDie('unchecked');
                            f();
                        }, 1100, 'swing');
                    }

                    f();

                }
            });


        }
    }
}

























var QuestionCtrl = function($scope) {
    
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
    $scope.kick_mode = false;

    $scope.selected = 0;
    $scope.wrong_selected = 0;

    $scope.animate = true;


    $scope.choiceLetter = function(code) {
        code = parseInt(code);
        code = code + 97;
        return String.fromCharCode(code);
    }

    $scope.select = function(id) {

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


    $scope.kickMode = function() {
        $scope.kick_mode = ($scope.kick_mode) ? false : true;
        $scope.reset();
    }


    $scope.$watch('answer_mode', function() {
        $scope.reset();
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


    $scope.updateText = function() {

        var selected = $scope.getSelected();

        if($scope.selected == 0) {

            $scope.answer_button_text = "Escolha a alternativa correta";
            $scope.answer_button_disabled = "primary disabled";
            $scope.help_text_1 = 'Analise a questão e clique na resposta correta.';

        } else if($scope.selected == 1) {

            $scope.answer_button_text = "Responder com certeza";
            $scope.answer_button_disabled = 'success';
            $scope.help_text_1 = 'Você acredita que a letra (' + $scope.choiceLetter(selected[0]) + ') seja a correta. Se não tiver certeza, pode selecionar até 2 outras respostas que acredite sejam corretas.';

        } else if($scope.selected > 1) {

            $scope.answer_button_text = "Responder em dúvida";
            $scope.answer_button_disabled = 'primary';
            
            var ht = 'Você está em dúvida entra as letras ';

            for(s in selected) {
                if(s == 0) {
                    ht += '(' + $scope.choiceLetter(s) + ')';
                }
                else if(s == $scope.selected-1) {
                    ht += ' e (' + $scope.choiceLetter(s) + ')';
                }
                else {
                    ht += ', (' + $scope.choiceLetter(s) + ')';
                }
            }

            $scope.help_text_1 = ht;

        }
    }

}










function registerQuestion(module) {
    module.controller('QuestionCtrl', QuestionCtrl);
    module.directive('highlight', highlightDirective);
}