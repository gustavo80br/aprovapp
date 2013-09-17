//
// Infinite Canvas Container
//
offCanvasModule.directive('infiniteCanvas', ['$timeout', function($timeout) {
	return {

		link: function($scope, $element, $attributes) {

			var q = undefined;
			var last_position = {'x':0, 'y':0}

			var enable_keys = false;

			var update_position = function(force_run) {

				// Obtem a posição atual do scroll horizontal

				// Só segue se tiver ocorrido scroll horizontal

				// Decide para que lado ir, direita ou esquerda
				// e define posição final

				// Define no escopo a casa atual baseado no resultado final

				// Manda animar
				// salva o id da animação para cancelamento no scope

				console.log('Executing scroll -> ' + $scope.monitor_scroll);

				if(!$scope.monitor_scroll) return;

		    	// Calculate X offset
		    	var offset = {
		    		'x': (typeof(this.pageXOffset) == 'number') ? this.pageXOffset : document.body.scrollLeft,
		    		'y': (typeof(this.pageYOffset) == 'number') ? this.pageYOffset : document.body.scrollTop
		    	}

	    		// Emit events if position changed
	    		if(last_position.x != offset.x || force_run) $scope.$broadcast('xscroll', offset.x, force_run);
	    		//if(last_position.y != offset.y || is_resizing) $scope.$broadcast('yscroll', offset.y);
	    	
		    	last_position = offset;

		    };


		    $(window).on('resize', function() {
                
                // Calcula formula de casas baseado no W x H atual
                // Salva formula no scope
                
                console.log('SCROLL por resize');
                scroll(true);
                $timeout(function() {
                	 $scope.$broadcast('resize');
                }, 100);
            });

			$(window).on('mousedown', function() {
				
				// Altera o Estado do usuário no scope
				// Avisa que ele está mexendo o mouse

				$scope.monitor_scroll = false;
			});

			$(window).on('mouseup', function() {
				
				// Altera o Estado do usuário no scope
				// Avisa que ele está mexendo o mouse

				$scope.monitor_scroll = true;
				console.log('SCROLL por mouse up');
				if($scope.monitor_click) {
					scroll();
				}
			});

			$(document).on('keydown', function(e){
				if(!enable_keys) return;
				switch(e.keyCode) {
					case 37:
						$scope.previous();
                   		$scope.monitor_scroll = false;
                   		break;
                   	case 39:
                   		$scope.next();
                		$scope.monitor_scroll = false;
                		break;
                	case 35:
                		$scope.goTo('last');
                		$scope.monitor_scroll = false;
                		break;
                	case 36: 
                		$scope.monitor_scroll = false;
                		$scope.goTo(1);
                		break;
				}

			});


			// Listen to scroll events to manage the canvas
			$(window).on('scroll', function(){
				console.log($scope.monitor_scroll);
				if(!$scope.monitor_scroll) return;
			    // Set scroll delay to reduce load
				var scroll_speed = 200;
				// Cancell if too fast scroll repetitive event
				$timeout.cancel(q);
				// Execute scroll
				console.log('SCROLL por scroll monitor');
				q = $timeout(scroll, scroll_speed);

			});


			$timeout(function() {
				console.log('SCROLL por link');
				scroll(true);
				enable_keys = true;
				$timeout(function() {
                	 $scope.$broadcast('resize');
                }, 100);
			}, 1000);

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

			// Listen to scroll events
			$scope.$on('positionupdate', function(e, data) {

				// If no offset to start with, get actual position
				if(!angular.isDefined(data.offset)) {
					data.offset = (typeof(window.pageXOffset) == 'number') ? window.pageXOffset : document.body.scrollLeft;
				}

				// Actualize staticRow position
				el.css('left', data.position * data.width);

				var scroll = function(from, to, scroll_height, duration, f) {

					//if(false) {
					if(!angular.isDefined(data.animate) || data.animate) {

						var step = (to - from)/duration * f;

						var q = $timeout(function() {
							if(!isNaN(parseInt(step, f))) {
								window.scrollTo(from + step, scroll_height);
								scroll(from + step, to, scroll_height, duration - f, f);
							}
						}, f);

					} else {
						window.scrollTo(to, scroll_height);
					}

				}

				function anima(opts) {
	   
				  var start = new Date  
				 
				  var id = setInterval(function() {
				    var timePassed = new Date - start
				    var progress = timePassed / opts.duration
				 
				    if (progress > 1) progress = 1
				     
				    var delta = opts.delta(progress)
				    opts.step(delta)
				     
				    if (progress == 1) {
				      clearInterval(id);
				      $scope.monitor_scroll = true;
				    }
				  }, opts.delay || 10)
				   
				}

				


				// Smooth scroll
				var h = $(window).scrollTop();
				scroll(data.offset, (data.position * data.width), h, 100, 10);

				$scope.monitor_scroll = false;


				var pos_start = data.offset;
				var pos_end = data.position * data.width;

				console.log('++' + data.offset);
				console.log('++' + pos_end);

				// anima({
				//     delay: 10,
				//     duration: 100, // 1 sec by default
				//     delta: function(p) {return p},
				//     step: function(delta) {
				//       $scope.monitor_scroll = false;	
				//       if(pos_end < pos_start) {
				//       	var go_to = pos_end + (pos_start * (1-delta));	
				//       } else {
				//       	var go_to = pos_start + (pos_end * delta);
				//       }
				//       console.log('d--'+delta);
				//       console.log('g--'+go_to);
				//       window.scrollTo(go_to, h); 
				//     }
				// });
		
			});
		}
	}
}]);


offCanvasModule.directive('staticRowBackground', [function() {
	return {
		link: function($scope, $element, $attributes) {
			var el = $($element[0]);
			// Listen to scroll events
			$scope.$on('resize', function(e) {
				el.css('width', $scope.width * $scope.data_set.length);
			});
		}
	}
}]);


offCanvasModule.directive('goTo', ['$timeout', function($timeout) {
	return {
		link: function($scope, $element, $attributes) {
			
			var el = $($element[0]);

			// var el = $($element);
			// Listen to scroll events
			
			el.on('focus', function(e) {
				$scope.monitor_click = false;
			});

			el.on('blur', function(e) {
				
				var val = el[0].value;
				
				if(isNaN(val)) el[0].value = $scope.user_pointer;
				else if(val < 1) el[0].value = 1;

				if(val != $scope.user_pointer) {
					$scope.goTo(val);
				}
				$timeout(function() {
					$scope.monitor_click = true;
				}, 300);
			});

			$scope.$watch('user_pointer', function() {
				el[0].value = $scope.user_pointer;
			});
		}
	}
}]);


//
//	Items in the Infinite Canvas
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

			// Only one of the items will be used to measure positon.
			// In this case we are using the 1, the 2nd in the data list
			if(number == 1) {
				// When the X scroll is changed, check to see the element position
				$scope.$on('xscroll', function(e, offset, force_run) {
					
					var view_size = element.width();
					
					var cut_point = 0.7;

					if(!force_run) {
						var position_float = (offset/(view_size * factor));
						var floor = Math.floor(position_float)
						var in_rate = position_float - floor;
						var position = (in_rate >= cut_point) ? floor + 1 : floor
						var max_pos = $scope.data_set.length-1;
						if(position > max_pos) position = max_pos;
					} else {
						var position = $scope.pointer;
					}
					
					var data = {
						'position': position,
						'factor': factor,
						'width': view_size,
						'offset': offset,
						'animate': !force_run
					}
					console.log('PU por XSCROLL');
					$scope.$emit('positionupdate', data);
				});
			}

		}

	}
}]);