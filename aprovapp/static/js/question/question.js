
function fisherYates ( myArray ) {
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
            
            

            var el = $(element[0]);
            var id = attributes.highlight;

            el.css({
                padding : '0.4em',
                border : '1px solid transparent',
                paddingRight: scope.max_padding + 'em'
            });

            el.data('css-animate', {
                padding: el.css('padding'),
                background: el.css('background'),
                border: '1px solid transparent'
            }),

            el.data('mouse-in', false);
            el.data('clicked', false);





            element.bind('mouseenter', function() {
                el.data('mouse-in', true);
                 if(!el.data('clicked')) {
                    el.css('background', '#FFF');
                }
            });

            element.bind('mouseleave', function() {
                el.data('mouse-in', false);
                if(!el.data('clicked')) {
                    if(scope.animate && typeof(el.animate) === 'function') {
                        el.animate(el.data('css-animate'));
                    } else {
                        el.css(el.data('css-animate'));
                    }
                }
            });




            element.bind('click', function() {
                
                if(el.data('clicked')) {
                    
                    el.data('clicked',false);
                    
                    el.animate(el.data('css-animate'), 'fast', 'swing');

                    scope.removeChoice(id);

                    scope.$apply();

                } else {
                    
                    if(scope.addChoice(id)) {

                        scope.$apply();

                        el.data('clicked',true);

                        padding = (scope.selected > 1) ? 
                            scope.max_padding/2 : scope.max_padding;

                        el.css({
                            border: '1px solid #F00',
                            paddingLeft: padding + 'em',
                            paddingRight: '0em',
                            background: '#FF0'
                        });
                        
                        
                        if(scope.animate && typeof(el.animate) === 'function') {
                            el.animate({
                                border: '1px solid transparent',
                                background: '#FFF'
                            }, 2000, 'swing');
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
    $scope.main = -1;

    $scope.max_padding = 4;
    $scope.max_selection = 3;
    $scope.animate = false;
    
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

    $scope.choose = function(id) {
        if($scope.selected < $scope.max_selection) {
            $scope.choices[id][1] = true
        }
    }

    $scope.addChoice = function(id) {
        
        if($scope.selected < $scope.max_selection) {
           
            $scope.selected += 1;
            $scope.choices[id][1] = true;
           
            if($scope.selected == 1)
                $scope.main = id;

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

    $scope.updateText = function() {

        if($scope.selected == 0) {

            $scope.answer_button_text = "Escolha a alternativa correta";
            $scope.answer_button_disabled = "primary disabled";
            $scope.help_text_1 = 'Analise a questão e clique na resposta correta.';

        } else if($scope.selected == 1) {

            $scope.answer_button_text = "Responder com certeza";
            $scope.answer_button_disabled = 'success';
            $scope.help_text_1 = 'Você acredita que a letra (' + $scope.choiceLetter($scope.main) + ') seja a correta. Se não tiver certeza, pode selecionar até  2 outras respostas que acredite sejam corretas.';

        } else if($scope.selected > 1) {

            $scope.answer_button_text = "Responder em dúvida";
            $scope.answer_button_disabled = 'primary';
            
            var ht = 'Você acredita que a letra (' + $scope.choiceLetter($scope.main) + ') seja a correta, mas está em dúvida entre a ';

            doubt = $scope.inDoubt();
            if(doubt.length>1) {
                ht += 'letra (' + $scope.choiceLetter(doubt[0]) + ') e (' + $scope.choiceLetter(doubt[1]) + ')';
            } else {
                ht += 'letra (' + $scope.choiceLetter(doubt[0]) + ')';
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