

modalModule.controller('dontTouchCtrl', ['$scope', 'dontTouchService', 'modalService', function($scope, dontTouchService, modalService) {

    $scope.defaults = {
        toggle : false,
        block : false,
        animate : true,
        spinner : false,
        color: 'black',
        spinnerColor: 'white',
        opacity: 0.8,
    }

    $scope.loadProperies = function(prop) {
        for(p in prop) $scope[p] = prop[p];
    }

    $scope.loadProperies($scope.defaults);

    $scope.on = function(prop) {
        $scope.loadProperies(prop);
        $scope.toggle = true;
    }

    $scope.off = function() {
        $scope.toggle = false;
        $scope.block = false;
        $scope.loadProperies($scope.defaults);
    }

    $scope.onClick = function() {
        if(!$scope.block) {
            $scope.off();
            modalService.dismiss();
        }
    }

    dontTouchService.init($scope);
}])




modalModule.controller('ModalCtrl', ['$scope', '$timeout', 'stateManager', 'modalService', 'dontTouchService', function($scope, $timeout, stateManager, modalService, dontTouchService) {

    $scope.title = '';
    $scope.lead = '';
    $scope.txt = '';
    
    $scope.visible = false;
    $scope.animate = true;

    $scope.confirm_btn = false;
    $scope.dismiss_btn = false;
    $scope.action_btn = false;

    $scope.confirm_caption = 'OK';
    $scope.dismiss_caption = 'NO';
    $scope.action_caption = 'ACTION';

    $scope.img = "";
    $scope.img_loaded = false;

    $scope.size = "";

    $scope.onConfirm = function() { return true; }
    $scope.onDismiss = function() { return true; }
    $scope.onAction = function() { return true; }

    $scope.default_top = 0;

    $scope.defaults = {
        animate : true,
        confirm_caption : 'OK',
        dismiss_caption : 'CANCEL',
        action_caption : 'ACTION',
        title : 'Modal Box',
        lead : 'The great Modal service',
        txt : 'A true friend in all situations!',
        size: '',
        img: '',
        img_loaded: false,
        spinner: false,
        spinnerColor: 'white',
        overlayColor: 'black',
        overlayOpacity: 0.8,
        onConfirm : function() { return true; },
        onDismiss : function() { return true; },
        onAction : function() { return true; }
    }

    $scope.loadProperties = function(prop) {
        for(p in prop) {
            if(p == 'onConfirm' || p == 'onDismiss' || p == 'onAction' ) {
                if(typeof(prop[p]) === 'function') {
                    $scope[p] = prop[p];
                }
            } else {
                $scope[p] = prop[p];
            }
        }
    }

    $scope.loadDefaults = function() {
        $scope.loadProperties($scope.defaults);
    }

    $scope.confirmAction =  function() {
        response = $scope.onConfirm($scope);
        if(response) $scope.hide();
    }

    $scope.dismissAction = function () {
        response = $scope.onDismiss($scope);
        if(response) $scope.hide();
    }

    
    $scope.customAction = function () {
        response = $scope.onAction($scope);
        if(response) $scope.hide();
    }


    $scope.showButtons = function() {
        if($scope.confirm_btn ||  $scope.dismiss_btn  || $scope.action_btn) return true;
        else return false;
    };


    $scope.hideButtons = function() {
        $scope.confirm_btn = false;
        $scope.dismiss_btn = false;
        $scope.action_btn = false;
    }


    $scope.show = function(block) {
        if(!$scope.visible) {
            
            // Set modal open state
            $scope.visible = true;
            stateManager.pushState([$scope.initial_state,"modal"]);

            // Turn on background overlay
            dontTouchService.on({
                block: block,
                animate: $scope.animate,
                
                spinner: $scope.spinner,
                spinnerColor: $scope.spinnerColor,
                color: $scope.overlayColor,
                opacity: $scope.overlayOpacity
            
            }, function() {
                $scope.hide();
            });

            if(angular.isDefined($scope.monitor_scroll)) {
                $scope.monitor_scroll = false;
            }
        }
    };


    $scope.hide = function() {
        if($scope.visible) {
            
            // Get out of open modal state
            $scope.visible = false;
            stateManager.replaceState([$scope.initial_state]);

            // Turn off the background overlay
            dontTouchService.off();

            // Reset modal contents, timeout wait for animation end
            $timeout(function() {
                $scope.loadDefaults();
            }, 250);
        
            if(angular.isDefined($scope.monitor_scroll)) {
                $scope.monitor_scroll = true;
            }

        }
    };

    modalService.init($scope);

    stateManager.registerInitialiser(function (pathComponents) {
        $scope.initial_state = pathComponents[0];
        if(!(pathComponents[1] == 'modal')) {
            $scope.hide();
        }
    })($scope);

}])