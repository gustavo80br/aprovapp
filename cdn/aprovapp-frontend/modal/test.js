var app = angular.module('aprovapp', ['modalModule'])


  app.controller('MainAreaCtrl',
    ['$scope', '$timeout', 'modalService', 'dontTouchService', function($scope, $timeout, modalService, dontTouchService) {

      $scope.modal_test_msg = 'Alert box';
      $scope.dont_touch_test_msg = 'Click to Test DONT TOUCH';

      $scope.test = "TESTING";
      $scope.x = 0;

      $scope.alert = function() {
        modalService.alert({
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
       modalService.alert({
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
      modalService.confirm({
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
      modalService.confirm({
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
          modalService.alert({
            title : 'OUTRO ALERTA!',
            lead : 'Esse é bom!'
          });
          return true;
        }
      });
    };

    
    $scope.simple = function() {
      modalService.confirm({
        title: "SIMPLES",
        animate: false
      });
    };


    $scope.questionReference = function(num) {
      
      if(num) var i = "/cdn/images/ref" + num + ".jpg";
      else var i = "http://placehold.it/5000x150";

      modalService.alert({
        
        block: false,
        title: "",
        lead: "",
        txt: "",
        confirm_caption: "CLOSE",
        img: i,
        size: "fullscreen", 
        spinner: true,
        spinnerColor: 'black',
        overlayColor: 'white',
        overlayOpacity: 1
      
      });
    };



    $scope.openDontTouch = function() {
      dontTouchService.on();
    }

    $scope.openDontTouchBlock = function() {
      dontTouchService.on({
        block: true
      });
    }

    $scope.openDontTouchSpinner = function() {
      dontTouchService.on({
        spinner: true,
        spinnerColor: 'green'
      });
    }

    $scope.openDontTouchSpinnerTimed = function() {
      
      dontTouchService.on({
        spinner: true,
        spinnerColor: 'green'
      });

      $timeout(function() {
        dontTouchService.toggle_spinner();
      },2000);

      $timeout(function() {
        dontTouchService.toggle_spinner();
      },4000);

    }

  }]);
