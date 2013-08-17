var modalModule = angular.module('modalModule', ['stateManager'])
    
// Module config. Mainly because of stateManager needs
.config(function($locationProvider) {
    // use html5 for stateManager if available
    if(Modernizr.history) { 
        $locationProvider.html5Mode(true);
    } else {
        $locationProvider.html5Mode(false).hashPrefix('!');
    }
})
