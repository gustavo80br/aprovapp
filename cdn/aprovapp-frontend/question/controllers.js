questionModule.controller('QuestionCtrl', ['$scope','$timeout', 'modalService', function($scope, $timeout, modalService) {
    
    $scope.id = -1;
    $scope.number = -1;

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


    $scope.setAsAnswered = function() {

        var selected = $scope.getAnswer();

        $scope.reset();

        if($scope.right_answer in $scope.answer) {
            $scope.is_right = true;
            $scope.answer_score = 1/selected;
        }
    
        if($scope.answer_score == 0) {

            $scope.pre_answer_area = false;
            $scope.answering_area = false;
            $scope.right_answer_area = false;
            $scope.doubt_answer_area = false;
            $scope.wrong_answer_area = true;

            $scope.answer_score = 1;

        /*} else if($scope.answer_score < 1) {

            $scope.pre_answer_area = false;
            $scope.answering_area = false;
            $scope.right_answer_area = false;
            $scope.doubt_answer_area = true;
            $scope.wrong_answer_area = false;*/

        } else {
         
            $scope.pre_answer_area = false;
            $scope.answering_area = false;
            $scope.right_answer_area = true;
            $scope.doubt_answer_area = false;
            $scope.wrong_answer_area = false;

        }

        $scope.answered = true;
    };


    $scope.submitAnswer = function() {
        
        // only submit if something is selected
        if($scope.selected < 1 || $scope.answered) return;

        // Change what is show
        $scope.pre_answer_area = false;
        $scope.post_answer_area = false;
        $scope.answering_area = true;

        // send the message via $http
        // mocking with $timoute
        $timeout(function() {

            // This RIGHT ANSWER should come through HTTP request
            // By senting the Question ID in $scope.id
            // STRONG SECURITY HERE
            $scope.right_answer = $scope.choices[1].id;

            if(angular.isDefined($scope.array_index)) {
                // To connect to question
                // Update questions
                $scope.data_set[$scope.array_index].is_answered = true;
                $scope.data_set[$scope.array_index].right_answer = $scope.right_answer;
            }

            // Set Answered state
            $scope.setAsAnswered();

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
        
        var answer = {};
        var selected = 0;
        
        // To connect with exam
        var exam_answer = [];
        
        for(c in $scope.choices) {
            var choice = $scope.choices[c];
            if(choice.selected) {
                answer[$scope.choices[c].id] = true;
                selected += 1;
                
                // To connect with exam
                exam_answer.push($scope.choices[c].id)
            }
        }
        
        $scope.answer = answer;
        
        // To connect with exam
        if(angular.isDefined($scope.array_index)) {
            $scope.data_set[$scope.array_index].answer = exam_answer;
        }

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

        $scope.getAnswer();

    }

    $scope.addChoice = function(id) {
        console.log('ADD CHOICE -> ' + id);
        if(!$scope.choices[id].selected) {
            if($scope.answer_mode == 1) {
                if($scope.selected < $scope.max_selection) {
                    $scope.choices[id].selected = true;
                    $scope.selected += 1;
                }   
            } else {
                if(!$scope.choices[id].wrong) {
                    $scope.choices[id].selected = true;
                    $scope.selected += 1;
                }
            }
        }
    }

    $scope.removeChoice = function(id) {
        console.log('REMOVE CHOICE -> ' + id);
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


    $scope.$watch('wrong_selected', function(newValue, oldValue) {
        if(newValue === oldValue) return;
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
        return parseInt($scope.answer_score*100);
    }

    $scope.updateText = function() {

        var selected = $scope.getSelected();

        if($scope.selected == 0) {

            $scope.answer_button_text = "VER RESPOSTA";
            $scope.answer_button_disabled = "secondary disabled";

        } else if($scope.selected > 0) {

            var value = parseInt((1/$scope.selected)*100);

            $scope.answer_button_text = "VER RESPOSTA";
            $scope.answer_button_disabled = '';

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
                img: $scope.reference,
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
                img: $scope.reference,
                spinner: true,
            });

        }
    }

    $scope.loadJSON = function(json) {

        // Is not JSON? Then end just now!
        if(!angular.isObject(json)) return;

        $scope.choices = [];

        var is_answered = false;
        if(json.is_answered) {
            var is_answered = true;
        }

        for(var prop in json) {
            $scope[prop] = json[prop];
        }

        var has_answer = false;
        if(angular.isDefined(json.answer) && json.answer.length) {
            has_answer = true;
            var tmp_answer = {};
            for(var a in json.answer) {
                tmp_answer[json.answer[a]] = true;
            }
        }
        
        if(json.shuffle) {
            fisherYates($scope.choices);
        }

        $timeout(function() {
            if(has_answer) {
                for(var i in $scope.choices) {
                
                    if(($scope.choices[i].id in tmp_answer)) {
                        if($scope.answer_mode) $scope.select(i);
                    } else {
                        if(!$scope.answer_mode) $scope.select(i);
                    }
                
                }
            }
             
            if(is_answered) $scope.setAsAnswered();

        },10);

    }


    /*$scope.loadJSON({
      "id": 9871,
      "enunciation": "Enunctiation text enunciation text",
      "choices": [
        {
          "id": 123,
          "text": "Option 1"
        },
        {
          "id": 456,
          "text": "Option 2"
        },
        {
          "id": 789,
          "text": "Option 3"
        },
        {
          "id": 901,
          "text": "Option 4"
        },
        {
          "id": 234,
          "text": "Option 5",
        }
      ],
      "reference": "http://placehold.it/1024x2048",
      "answer_mode": 1,
      "answer": [123, 456, 789],
      "right_answer": 456,
      "shuffle": true
    });*/


}]);