var app = angular
  .module('aprovapp', ["stateManager"])
  .config(function($locationProvider) {
      if(Modernizr.history) { // use html5 if available
        $locationProvider.html5Mode(true);
      } else {
        $locationProvider.html5Mode(false).hashPrefix('!');
      }
  });


  registerDontTouch(app);
  registerModal(app);

  app.controller('MainAreaCtrl',
    ['$scope', 'modalService', 'dontTouchService', function($scope, modal, dontTouch) {
      
      $scope.modal_test_msg = 'Alert box';
      $scope.dont_touch_test_msg = 'Click to Test DONT TOUCH';

      $scope.test = "TESTING";
      $scope.x = 0;

      
      $scope.alert = function() {
        modal.alert({
          block: false,
          title: "Livre",
          lead: "Basta clicar ou apertar ESC",
          txt: "em qualquer lugar para esconder",
          onConfirm: function(scope) {
            $scope.x += 1;
            $scope.test = "OK";
            return true;
          },
          onDismiss: function(scope) {
            $scope.x += 1;
            $scope.test = "DISMISS";
            return true;
          }
        });
      };

      $scope.alertBlock = function() {
       modal.alert({
        block: true,
        title: "Livre",
        lead: "Somente o ESC ou o clique em algum botão",
        txt: "Só assim para fechar esta janela",
        confirm_caption: "Sou um botão OK diferente",
        onConfirm: function(scope) {
          $scope.x += 1;
          $scope.test = "OK";
          return true;
        },
        onDismiss: function(scope) {
          $scope.x += 1;
          $scope.test = "DISMISS";
          return true;
        }
      });
     };

     $scope.confirm = function() {
      modal.confirm({
        block: false,
        title: "Livre",
        lead: "Somente o ESC ou o clique em algum botão",
        txt: "Só assim para fechar esta janela",
        confirm_caption: "CONFIRMA",
        onConfirm: function(scope) {
          $scope.x += 1;
          $scope.test = "OK";
          return true;
        },
        onDismiss: function(scope) {
          $scope.x += 1;
          $scope.test = "DISMISS";
          return true;
        }
      });
    };

    $scope.confirmWithAction = function() {
      modal.confirm({
        block: false,
        title: "Livre",
        lead: "Somente o ESC ou o clique em algum botão",
        txt: "Só assim para fechar esta janela",
        confirm_caption: "CONFIRMA",
        action_btn: true,
        action_caption: "ABRIR UM ALERTA",
        onConfirm: function(scope) {
          $scope.x += 1;
          $scope.test = "OK";
          return true;
        },
        onDismiss: function(scope) {
          $scope.x += 1;
          $scope.test = "DISMISS";
          return true;
        },
        onAction: function(scope) {
          $scope.x += 1;
          $scope.test = "ACTION";
          modal.alert({
            title : 'OUTRO ALERTA!',
            lead : 'Esse é bom!'
          });
          return true;
        }
      });
    };

    
    $scope.simple = function() {
      modal.confirm({
        title: "SIMPLES",
        animate: false
      });
    };


    $scope.questionReference = function(num) {
      
      modal.alert({
        
        block: false,
        title: "",
        lead: "",
        txt: "",
        confirm_caption: "OK",
        img: "http://192.168.0.80:5000/static/img/ref" + num + ".jpg"
      
      });
    };



    $scope.openDontTouch = function() {
      dontTouch.on();
    }

    $scope.openDontTouchBlock = function() {
      dontTouch.on(true);
    }

  }]);
