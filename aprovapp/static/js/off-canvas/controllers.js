offCanvasModule.controller('offCanvasCtrl', ['$scope', '$timeout', 'modalService', function($scope, $timeout, modalService) {
	
	$scope.data_set = [];
	$scope.data_length;

	$scope.pointer = 0;

	$scope.factor = 1;
	$scope.threshold = 0.8;

	$scope.scrolling = false;
	$scope.moving = false;
	$scope.mouse_down = false;
	$scope.touch_on = false;
	$scope.modal_open = false;

	$scope.scroll_position = 0;


	$scope.scroll_w = 0;
	$scope.client_sizes = {};

	$scope.viewport_scale = 1;

	$scope.active_time = 0; // Time active studing
	$scope.active_unit = 1000; // 1 minute
	$scope.idle_timeout = 10; // 5 minutes
	$scope.idle_countdown = 5; // 1 minute 
	$scope.idle_timer = null; // Id for timeout
	$scope.count_timer = null; // Id for setInterval
	$scope.idle_countdown_timer = null; // Id for countdown timeout
	$scope.idle_status = 1 // 2 is PRE-IDLE, 3 is IDLE

	$scope.increment_active_time = function() {
		$scope.active_time += 1;
		$scope.$apply();
	}

	$scope.imHere = function() {

		if($scope.idle_status == 3) return;
		if($scope.idle_status == 2) {
			$scope.idle_status = 1;
			modalService.dismiss();
		}

		// Turnoff timeouts for idle and idel_countdown
		if($scope.idle_timer)
			$timeout.cancel($scope.idle_timer);
		if($scope.idle_countdown_timer)
			$timeout.cancel($scope.idle_countdown_timer);
		// Enable timeout for idle again
		$scope.idle_timer = $timeout($scope.goPreIdle, $scope.active_unit * $scope.idle_timeout);
		// If not counting time, start it
		if(!$scope.count_timer)
			$scope.count_timer = window.setInterval($scope.increment_active_time, $scope.active_unit);

		return true;
	};

	$scope.goPreIdle = function() {
		// Set status
		$scope.idle_status = 2;
		$scope.pre_idle_modal = true;
		// Show a message informing that we are going IDLE very soon
		modalService.message({
            block: false,
            title: "Você está ai? Ainda está estudando?",
            lead: "A contagem de tempo de estudo irá parar em instantes",
            txt: "Detectamos inatividade por mais de " + $scope.idle_timeout + " minutos, a contagem de tempo de estudo irá parar em instantes. Realize qualquer interação para informar que está ativo!",
            onDismiss: $scope.imHere
        });
        // Start IDLE countdown
        $scope.idle_countdown_timer = $timeout($scope.goIdle, $scope.idle_countdown * $scope.active_unit);
	};

	$scope.goIdle = function() {
		// Set status
		$scope.idle_status = 3;
		window.clearInterval($scope.count_timer);
		$scope.count_timer = null;
		$scope.idle_timer = null; // Id for timeout
		$scope.count_timer = null; // Id for setInterval
		$scope.idle_countdown_timer = null; // Id for countdown timeout
		
		

		// Modal to inform IDLE
		
		var props = {
            title: "Estudo Interrompido",
            lead: "Devido à inatividade, paramos a contagem de seu tempo de estudo",
            txt: "Clique no botão abaixo, ou em qualquer área da tela e volte a estudar.",
            block: false,
            confirm_btn: true,
            confirm_caption: "Voltar ao Estudo",
            onConfirm: $scope.unblockIdle,
            onDismiss: $scope.unblockIdle
        }

		if(Modernizr.touch) {
			modalService.change(props)
		} else {
			modalService.alert(props);
		}
	}

	$scope.unblockIdle = function() {
		$scope.idle_status = 1;
		$scope.imHere();
		return true;
	}


	$scope.loadData = function(data_set) {
		// Initialize questions
		$scope.data_set = data_set;
		$scope.data_length = data_set.length;

		//if(json.shuffle) {
            fisherYates($scope.data_set);
        //}

		//Add questions array index inside question
		for(var i in $scope.data_set) {
			$scope.data_set[i].array_index = i;
		}

		$scope.imHere();

	};

	$scope.setScrollPosition = function(scroll_w, scroll_h, vp_scale) {
		$scope.scroll_w = scroll_w;
		$scope.scroll_h = scroll_h;
		$scope.viewport_scale = vp_scale;
	};

	$scope.definePointer = function() {

		var actual_scroll = $scope.scroll_w;
		var old_scroll = $scope.scroll_position;
		var position = $scope.pointer;

		var pos_diff = (actual_scroll - old_scroll)/($scope.view_port * $scope.factor);
		var left = false;
		var right = false;
		var big_diff = false;

		if(!$scope.modal_open) {
			// Math to decide which position to go (define pointer)
			if(Math.abs(pos_diff) > 1) {
				// Scroll more than a whole view port
				var pos_float = (actual_scroll/($scope.view_port * $scope.factor));
				position = Math.round(pos_float);
				var in_view_rate = pos_float - position;
			} else {
				// Scroll less tha one full viewport
				if(pos_diff > 0) {
					// Going to the right
					var update = 1
				} else {
					// Going to the left
					var update = -1
				}
				pos_diff = Math.abs(pos_diff);
				if(pos_diff >= $scope.threshold) position += update; 
			}
		}

		if(!$scope.modal_open || ($scope.modal_open && $scope.viewport_scale <= 1)) {
			$scope.goTo(position, 'update', false);
		}

	};

	$scope.setScreenSizes = function(sizes) {
		$scope.view_port = sizes.view_w;
		$scope.$emit('resize');
	};

	$scope.goTo = function(position, cause) {

		if($scope.modal_open && cause != 'update') return;

		// Standard moves
		var moves = {
			'next' : $scope.pointer + 1,
			'prev' : $scope.pointer - 1,
			'last' : $scope.data_length - 1,
			'first' : 0
		}

		// If out of scope, adjust it
		if(moves[position] > $scope.data_length - 1) position = $scope.data_length - 1;
		else if(moves[position] < 0) position = 0;

		// Set the pointer
		if(angular.isDefined(moves[position])) $scope.pointer = moves[position];
		else $scope.pointer = position;

		// Set the scroll position for the pointer
		$scope.scroll_position = $scope.pointer * $scope.view_port;

		// Ask the canvas to move
		$scope.$emit('move', cause);
	};


	$scope.$watch('pointer', function() {
		// Update the user pointer (the pointer starting from 1)
		$scope.user_pointer = parseInt($scope.pointer) + 1;
	});

	$scope.$on('modalshow', function() {
		$scope.modal_open = true;
	});

	$scope.$on('modalhide', function() {
		$scope.modal_open = false;
		if($scope.pre_idle_modal) $scope.pre_idle_modal = false;
	});


	$scope.loadData(data_example);

}]);