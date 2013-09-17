offCanvasModule.controller('offCanvasCtrl', ['$scope', function($scope) {
	
	$scope.data_set = [];
	$scope.size;

	$scope.user_pointer = 0;
	$scope.pointer = 0;
	$scope.speed = 0;

	$scope.factor = 1;
	$scope.width = -1;

	$scope.monitor_scroll = true;
	$scope.monitor_click = true;

	$scope.loadData = function(data_set) {
		// Initialize questions
		$scope.data_set = data_set;
		$scope.size = data_set.length;

		//if(json.shuffle) {
            fisherYates($scope.data_set);
        //}

		//Add questions array index inside question
		for(var i in $scope.data_set) {
			$scope.data_set[i].array_index = i;
		}

	};

	$scope.next = function() {
		
		if($scope.pointer >= $scope.data_set.length-1) return;

		position = $scope.pointer + 1;
		
		var data = {
			'position': position,
			'factor': $scope.factor,
			'width': $scope.width
		};
		
		console.log('PU por NEXT');
		$scope.$emit('positionupdate', data);
	};

	$scope.previous = function() {
		
		if($scope.pointer <= 0) return;

		position = $scope.pointer - 1;
		
		var data = {
			'position': position,
			'factor': $scope.factor,
			'width': $scope.width
		};

		console.log('PU por PREVIOUS');
		$scope.$emit('positionupdate', data);
	};

	$scope.goTo = function(position) {

		if(isNaN(position) && position!="last") {
			return;
		} else if(angular.isUndefined(position) || position < 1) {
			$scope.pointer = 0;
		} else if(position=="last" || position > $scope.size) {
			$scope.pointer = $scope.size - 1;
		} else {
			$scope.pointer = position - 1;
		}
		
		var data = {
			'position': $scope.pointer,
			'width': $scope.width
		};

		console.log($scope.pointer + " " + $scope.width);

		console.log('PU por GOTO');
		$scope.$emit('positionupdate', data);

	};


	// This message is emited by one of the items.
	// The item receives the indication that the scroll stopped 'xscroll'
	// And then calculate position abased on item parameters and
	// based on its size. After calculation, informs.
	$scope.$on('positionupdate', function(e, data) {
		$scope.pointer = data.position;
		$scope.width = data.width;
	});

	$scope.$watch('pointer', function() {
		$scope.user_pointer = $scope.pointer + 1;
	})

	//$scope.$watch('user_pointer', function() {
	//	$scope.pointer = $scope.user_pointer - 1;
	//	var data = {
	//		'position': $scope.pointer,
	//		'width': $scope.width,
	//	};
	//	$scope.$broadcast('positionupdate', data);
	//})

	$scope.loadData(data_example);
	$scope.$broadcast('update', true);

}]);