examModule.directive('swipe', [function() {
    return {
        link: function($scope, $element, $attributes) {

            $(document).on('swipeUp', function() {
                $scope.shiftLeft();
            });

            $(document).on('swipeDown', function() {
                $scope.shiftRight();
            });

        }
    }
}]);