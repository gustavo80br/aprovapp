examModule.controller('ExamCtrl', ['$scope', function($scope, examService) {
	
	$scope.questions = [];
	$scope.pointer = -1;
	$scope.question_set = [];
	$scope.questions_loaded = [];


	$scope.loadQuestions = function(questions) {

		// Initialize questions
		$scope.questions = questions;
		$scope.questions_len = questions.length;

		//Add null questions in the beggining and at the end
		$scope.questions.unshift(0);
		$scope.questions.push(0);

		//Add questions array index inside question
		for(var i in $scope.questions) {
			$scope.questions[i].array_index = i;
		}

		// Initialize question set
		$scope.questions_set = [];
		for(var i=0; i<3; i++) {
			$scope.question_set[i] = $scope.questions[i];
		}

		$scope.pointer = 1;
	}
	

	$scope.shiftRight = function() {

		// Do nothing if we are at the beggining of the list
		if($scope.pointer <= 1) return;

		// Shift
		$scope.question_set.pop();
		$scope.question_set.unshift($scope.questions[$scope.pointer - 2]);		
		
		// Update pointer
		$scope.pointer--;

		// Log for debug
		console.log($scope.question_set);

	}

	$scope.shiftLeft = function() {
		
		// Do nothing if we are at the end of the list
		if($scope.pointer >= $scope.questions_len) return;

		// Shift
		$scope.question_set.shift();
		$scope.question_set.push($scope.questions[$scope.pointer + 2]);

		// Update pointer
		$scope.pointer++;

		// Log for debug
		console.log($scope.question_set);

	}

	$scope.loadQuestions(data_json);

}]);