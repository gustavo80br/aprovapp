/**

@service DONT TOUCH
==================

Service to block the user interaction

*/
var dontTouch = function() {

    var dt = {};

    dt.body = $('body');
    dt.overlay = $(document.createElement('div'));
 
    dt.opacity = 80;
    dt.color = '#000';

    dt.style_template = 'display:{{DISPLAY}}; alpha(opacity={{OPA1}});-khtml-opacity: {{OPA2}};opacity:{{OPA2}};-moz-opacity: {{OPA2}};background-color:{{BG}};position:fixed;width:100%;height:100%;top:0px;left:0px;z-index:1000;';

    dt._getStyle = function(display) {
        var opa = this.opacity/100;
        var style = this.style_template;
        style = style.replace('{{DISPLAY}}',display);
        style = style.replace('{{OPA1}}',this.opacity);
        style = style.replace('{{OPA2}}',opa);
        style = style.replace('{{OPA2}}',opa);
        style = style.replace('{{OPA2}}',opa);
        style = style.replace('{{BG}}',this.color);
        return style;
    }

    /**

    @method on

    Set the overlay on. Accept overlay opacity and color as optional arguments

    Example: on(80,'#FFF')

    Sets overlay opacity to 80% and color to white.

    */
    dt.on = function(opacity, color) {
        if(!(typeof(opacity)==='undefined')) this.opactity = opacity;
        if(!(typeof(color)==='undefined')) this.color = color;
        if(typeof this.overlay.fadeIn == 'function') {
            this.overlay.attr('style', this._getStyle('none'));
            this.overlay.fadeIn();
        } else {
            this.overlay.attr('style', this._getStyle('block'));
        }
    }

    /**

    @method off

    Turns the overlay off

    */
    dt.off = function() {
        if(typeof this.overlay.fadeOut == 'function') {
            this.overlay.fadeOut();
        } else {
            this.overlay.attr('style', 'display:none');
        }
    }

    dt.overlay.attr('style', dt._getStyle('none'));
    dt.body.append(dt.overlay);

    return dt;
}






















var modalDirective = function() {
    return {
        replace: true,
        template:   '<div id="modal-box" class="reveal-modal" ng-show="visible" ng-style="style" ng-controller="ModalController">'
                  + '<h2 ng-show="title.length">{{ title }}</h2>'
                  + '<p class="lead" ng-show="lead.length">{{ lead }}</p>'
                  + '<p ng-show="txt.length">{{ txt }}</p>'
                  + '<a class="close-reveal-modal" ng-click="close()">x</a>'
                  + '<div ng-show="showButtons()">'
                  + '<a href="#" class="button small" ng-click="okAction()" ng-show="ok_btn">{{ ok_caption }}</a>'
                  + '<a href="#" class="button small" ng-click="customAction()" ng-show="action_btn">{{ action_caption }}</a>'
                  + '<a href="#" class="button small" ng-click="cancelAction()" ng-show="cancel_btn">{{ cancel_caption }}</a>'
                  + '</div></div>'
    }
}


var ModalController = function($scope, modal) {

    $scope.title = 'asdsadsadsa';
    $scope.lead = 'dasdasdsa';
    $scope.txt = 'sadsadsa';
    
    $scope.visible = false;

    $scope.ok_btn = false;
    $scope.cancel = false;
    $scope.action_btn = false;

    $scope.ok_caption = 'OK';
    $scope.cancel_camption = 'NO';
    $scope.action_caption = 'ACTION';

    $scope.style = {}

    $scope.showButtons = function() {
        if($scope.ok_btn ||  $scope.cancel_button || $scope.action_btn) return true;
        else return false;
    };

    $scope.hideButtons = function() {
        $scope.ok_btn = false;
        $scope.cancel_btn = false;
        $scope.action_btn = false;
    }

    $scope.close = function() {
        modal.dismiss();
    };

    modal._bindScope($scope);
    modal._init();

}


var modalService = function(dontTouch) {

    var m = {};
    
    m.modal = $('#modal-box');
 
    m.settings = {
        animation_speed : 200,
        style: {
            open : {
                'opacity' : 1,
                'visibility' : 'visible',
                'display' : 'block',
                'z-index' : 1001,
            },
            close : {
                'opacity' : 0,
                'visibility' : 'visible',
                'display' : 'block',
                'z-index' : 1001,
            }
        }
    }

    m.offset = 0;
    m.height = 0;
    m.top = 0;

    m.is_open = false;

    m.ok_callback = function() {};
    m.cancel_callback = function() {};
    m.action_callback = function() {};

    m._bindScope = function(scope) {
        this.scope = scope;
    }


    m.alert = function(title, lead, content, callback) {
        // For alert, no need buttons
        this.scope.hideButtons();
        // Dismiss on click anywhere
        dontTouch.overlay.bind('click', m._overlayClickCallback(this));
        // Register the dismiss callback
        this.cancel_callback = callback;
        // Show the box
        this._open();
    }


    m._overlayClickCallback = function(self) {
        return function() {
            self.dismiss();
            $(this).unbind('click');
        }
    }


    m._open = function() {

        this.in_transition = true;

        if(this.is_open) {
            this.dismiss();
            setTimeout(
                this._openTimeoutCallback(this),
                this.settings.animation_speed
            );
        } else {

            dontTouch.on();
            
            if(typeof this.modal.animate == 'function') {               
                console.log('com animacao');
                this.modal.stop().animate(this.settings.style.open,
                    this.settings.animation_speed,
                    'swing',
                    this._openCallback(this)
                );
            } else {
                console.log('sem animacao');
                this.modal.attr('style', this._getStyle('open'));
                this.is_open = true;
                this.in_transition = false;
                this.cancel_callback();
                this.cancel_callback = function() {};
            }
        }
    }


    m._openTimeoutCallback = function(self) {
        return function() {
            self._open();
        }
    }


    m._openCallback = function(self) {
        return function() {
            self.is_open = true;
            self.in_transition = false;
        }
    }

    m.dismiss = function() {
        
        this.in_transition = true;
        dontTouch.off();

        if(typeof this.modal.animate == 'function') {
            this.modal.stop().animate(this.settings.style.close,
                this.settings.animation_speed,
                'swing',
                m.dismissCallback(this));

        } else {
            this.scope.style = m.settings.style.close;
            this.is_open = false;
        }
    }


    m.dismissCallback = function(self) {
        return function() {
            self.is_open = false;
            self.in_transition = false;
        }
    }


    m._setTop = function() {
        
        this.offset = $(window).scrollTop();
        this.scope.style = m.settings.style.open;
        this.height = this.modal.height();
        this.scope.style = m.settings.style.close;

        this.top = parseInt(m.modal.css('top'),10);

        this.settings.style.close['top'] = (-(this.offset + this.top + this.height)) + 'px';
        this.settings.style.open['top'] = (this.offset + this.top) + 'px';

    }

    m._init = function() {
        this._setTop();
        this.scope.style = m.settings.style.close;
    }

    return m;
}


function registerModal(module) {
    module.factory('dontTouch', dontTouch);
    module.factory('modal', ['dontTouch', modalService]);
    module.controller('ModalController', ['$scope', 'modal', ModalController]);
    module.directive('modalTag', modalDirective);
}