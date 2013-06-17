


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

            // Store states CSS
            el.data('css-unchecked', {
                padding : scope.padding + 'em',
                border : '1px solid transparent',
                paddingRight: scope.side_padding + 'em',
                background: 'transparent'
            }),

            el.data('css-hover', {
                background: '#FFF'
            }),

            el.data('css-sure-start', {
                border: '1px solid #060',
                paddingRight: scope.padding + 'em',
                paddingLeft: scope.side_padding + 'em',
                background: '#9F9'
            }),

            el.data('css-sure-end', {
                border: '1px solid transparent',
                background: '#DFD'
            }),

            el.data('css-doubt-start', {
                border: '1px solid #F00',
                paddingLeft: scope.side_padding + 'em',
                paddingRight: scope.padding + 'em',
                background: '#FF0'
            }),

            el.data('css-doubt-end', {
                border: '1px solid #F00',
                paddingRight: '0em',
                background: '#FFB'
            }),

            // Instantiate state variables
            el.data('mouse-in', false);
            el.data('clicked', false);

            // Setup unchecked css
            el.css(el.data('css-unchecked'));

            // Auxiliar for animation
            var animateOrDie = function(status) {
                var css_end = 'css-' + status + '-end';
                var css_start = 'css-' + status + '-start';
                if(scope.animate && typeof(el.animate) === 'function') {
                    if(!(status == 'unchecked')) el.css(css_start);
                    else css_end = 'css-unchecked';
                    console.log('animando para ' + css_end);
                    el.animate(el.data(css_end));
                } else {
                    if(status == 'unchecked') css_end = 'css-unchecked';
                    console.log('mudando para ' + css_end);
                    el.css(el.data(css_end));
                }
            }

            // Bind mouseenter for hover effect
            element.bind('mouseenter', function() {
                el.data('mouse-in', true);
                if(!el.data('clicked')) {
                    el.css(el.data('css-hover'));
                }
            });

            // Bind mouseleave for hover effect
            element.bind('mouseleave', function() {
                el.data('mouse-in', false);
                if(!el.data('clicked')) {
                    animateOrDie('unchecked');
                }
            });


            $(document).bind('inDoubt', function() {
                if(el.data('clicked')) {
                    animateOrDie('doubt');
                }
            });

            $(document).bind('noDoubt', function() {
                if(el.data('clicked')) {
                    animateOrDie('sure');
                }
            });            


            element.bind('click', function() {
                
                if(el.data('clicked')) {
                    
                    el.data('clicked',false);
                    
                    animateOrDie('unchecked');

                    scope.removeChoice(id);

                    scope.$apply();

                    if(scope.selected == 1) {
                        $(document).trigger('noDoubt');
                    }

                } else {
                    
                    if(scope.addChoice(id)) {

                        scope.$apply();

                        el.data('clicked',true);

                        if(scope.selected == 2) {
                        
                            $(document).trigger('inDoubt');
                        
                        } else if(scope.selected > 2) {
                            animateOrDie('doubt');
                        } else {                           
                            animateOrDie('sure');
                        }
                    }
                }
            });

            $(document).bind('keyup', function(e) {
                console.log(scope.index);
                if(e.keyCode == 27 && el.data('clicked')) 
                    el.trigger('click');
            });

        }
    }
}



var answerButton = function() {
    return {
        link: function(scope, element, attributes) {

            var el = $(element[0]);
            el.addClass('disabled');
        }
    }
}



var QuestionCtrl = function($scope) {
    
    $scope.enunciation = 'Com fundamento na Lei no 6.745, de 28 de dezembro de 1985, que estabelece o Estatuto dos Servidores Públicos Civis do Estado de Santa Catarina, assinale a alternativa correta.';
    $scope.choices = [
        ['A readaptação de funcionário poderá acarretar decesso ou aumento de remuneração.', false],
        ['O treinamento constitui atividade excepcional nos cargos públicos estaduais.', false],
        ['Considera-se trabalho noturno, para os fns deste Estatuto, o prestado entre 22 (vinte e duas) horas e 05 (cinco) horas do dia seguinte.', false],
        ['O funcionário gozará obrigatoriamente 30 (trinta) dias ininterruptos de férias por ano, de acordo com a escala organizada.', false],
        ['Estabilidade é o direito que adquire o funcionário nomeado por concurso de não ser afastado do serviço público ou do cargo ocupado', false]
    ];

    fisherYates($scope.choices); 

    $scope.answer_button_text = '';
    $scope.answer_button_disabled = '';
    $scope.help_text_1 = '';
    $scope.help_text_2 = '';

    $scope.selected = 0;

    $scope.padding = 0.4;
    $scope.side_padding = 3;
    $scope.max_selection = 3;
    $scope.animate = true;
    
    $scope.inDoubt = function() {
        var response = [];
        for(c in $scope.choices) {
            if(!(c == $scope.main)) {
                if($scope.choices[c][1]) response.push(c);
            }
        }
        return response
    }

    $scope.choiceLetter = function(code) {
        code = parseInt(code);
        code = code + 97;
        return String.fromCharCode(code);
    }

    $scope.addChoice = function(id) {
        
        if($scope.selected < $scope.max_selection) {
           
            $scope.selected += 1;
            $scope.choices[id][1] = true;

            $scope.updateText();

            return true;
        }
        
        return false;
    }

    $scope.removeChoice = function(id) {
        $scope.selected -= 1;
        $scope.choices[id][1] = false;
        $scope.updateText();
    }


    $scope.getSelected = function() {
        var selected = [];
        for(c in $scope.choices) {
            if($scope.choices[c][1]) {
                selected.push(c);
            }
        }
        return selected;
    }


    $scope.updateText = function() {

        if($scope.selected == 0) {

            $scope.answer_button_text = "Escolha a alternativa correta";
            $scope.answer_button_disabled = "primary disabled";
            $scope.help_text_1 = 'Analise a questão e clique na resposta correta.';

        } else if($scope.selected == 1) {

            $scope.answer_button_text = "Responder com certeza";
            $scope.answer_button_disabled = 'success';
            $scope.help_text_1 = 'Você acredita que a letra (' + $scope.choiceLetter($scope.main) + ') seja a correta. Se não tiver certeza, pode selecionar até 2 outras respostas que acredite sejam corretas.';

        } else if($scope.selected > 1) {

            $scope.answer_button_text = "Responder em dúvida";
            $scope.answer_button_disabled = 'primary';
            
            var ht = 'Você está em dúvida entra as letras ';

            var selected = $scope.getSelected();

            
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

    $scope.updateText();

}

function registerQuestion(module) {
    module.controller('QuestionCtrl', QuestionCtrl);
    module.directive('highlight', highlightDirective);
    module.directive('answerButton', answerButton);
}