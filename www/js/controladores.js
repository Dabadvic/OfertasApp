angular.module('controladoresApp', ['serviciosApp'])

.controller('controladorOfertas', function($scope, servicioOfertas, $state) {
  $scope.ofertas = servicioOfertas.ofertas;

  $scope.preferencias = function() {
		console.log("Cambia vista a preferencias");
		$state.go('preferencias');
	}
})

.controller('controladorBarra', function MyCtrl($scope, $ionicHistory) {
  	$scope.atras = function() {
  		console.log("Vuelve atrás");
    	$ionicHistory.goBack();
  	};
})

.controller('controladorPreferencias', function($scope, $ionicModal, $timeout) {
  $scope.notificaciones = function() {
    console.log('Cambio preferencias recibir notificaciones', $scope.recibirNotificaciones.checked);
  };

  $scope.recibirNotificaciones = {checked: true};

  //----------------------------Login---------------------------------
  
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  //------------------------------------------------------------------

  $scope.registrar = function() {
    console.log('Registrando con clave', $scope.loginData.key);

    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };


})

.controller('controladorDetalles', function($scope, oferta) {
  $scope.oferta = oferta
});
