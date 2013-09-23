
/*---------------------------------------------------------------------

dontTouchService

Creates an overlay blocking user interaction

Usage:

    dontTouch.on(properties, callback)
    dontTouch.off()

Properties will define overlay parameters. Callback function 
will be called when the overlay is removed. Properties are:

    block (false)           : user can't hide the overlay by click
    animate (true)          : animate show/hide of the overlay
    spinner (false)         : show spinner in overlay
    color (black)           : overlay color
    spinnerColor (white)    : spinner color
    opacity: 0.8,           : overlay opacity

---------------------------------------------------------------------*/

modalModule.factory('dontTouchService', ['$timeout', function($timeout) {

    var dt = {}

    dt.off_callback = function() {};

    dt.init = function(scope) {
        this.scope = scope;
    }

    dt.on = function(prop, off_callback) {
        this.scope.on(prop);
        if(typeof(off_callback) === 'function') {
            this.off_calback = off_callback;
        }
    }

    dt.off = function() {
        this.scope.off();
        if(typeof(this.off_calback) === 'function') {
            this.off_callback(this);
        }
    }

    dt.toggle_spinner = function() {
        if(this.scope.spinner) this.scope.toggle_spinner = !this.scope.toggle_spinner;
    }

    dt.resize = function() {
        this.scope.resize_trigger++;
    }

    return dt;

}])




modalModule.factory('modalService', ['$timeout', function($timeout) {

    var m = {};

    m.hide_before_show = false;

    m.init = function(scope) {
        this.scope = scope;
    }

    m.message = function(prop) {
        if(this.scope.visible) {
            this.scope.hide();
            $timeout(function() {
                m.message(prop);
            }, 250);
        } else {
            this.scope.hideButtons();
            this.scope.loadProperties(prop);
            this.scope.show(prop.block);
        }
    }

    m.alert = function(prop) {

        if(this.scope.visible) {
            this.scope.hide();
            $timeout(function() {
                m.alert(prop);
            }, 250);
        } else {
            this.scope.hideButtons();
            this.scope.loadProperties(prop);
            this.scope.confirm_btn = true;
            this.scope.show(prop.block);
        }

    }

    m.confirm = function(prop) {

        // For alert, no need buttons

        // Show the box
        if(this.scope.visible) {
            this.scope.hide();
        } else {
            this.scope.hideButtons();
            this.scope.loadProperties(prop);
            this.scope.confirm_btn = true;
            this.scope.dismiss_btn = true;
            this.scope.show(prop.block);
        }
    }

    m.dismiss = function() {
        this.scope.dismissAction();
    }

    return m;
}])