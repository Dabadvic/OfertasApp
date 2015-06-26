angular.module('controladores.ofertas', ['servicio.datos', 'servicio.mapas', 'ionic'])

.controller('controladorOfertas', function($scope, datos, $state, $localstorage, $ionicLoading) {
  $scope.ofertas = datos.getOfertas();

  console.log("Carga main");

  $scope.$on('$ionicView.beforeEnter', function() {
	$scope.nombre = $localstorage.get("user", "");
  })

  $scope.preferencias = function() {
	console.log("Cambia vista a preferencias");
	$state.go('preferencias');
  }

  $scope.recargarDatos = function() {
  	console.log("Se van a recargar los datos");
  	datos.cargarDatos();
  	$scope.ofertas = datos.getOfertas();
  }

})

.controller('controladorBarra', function ($scope, $ionicHistory) {
  	$scope.atras = function() {
    	$ionicHistory.goBack();
  	};
})


.controller('controladorDetalles', function($scope, oferta, $ionicModal, $compile, $ionicLoading) {
  $scope.oferta = oferta;

  $scope.mapControl = {
  };

  // Crear la ventana modal que usaremos para el mapa
  $ionicModal.fromTemplateUrl('templates/mapa_modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.abreMapa = function() {
  	$scope.modal.show();

  	$ionicLoading.show({
        template: 'loading'
    });

  	navigator.geolocation.getCurrentPosition(function (pos) {
  		$scope.mapControl.calcRoute(pos.coords.latitude, pos.coords.longitude, oferta.latitud, oferta.longitud);
  		$ionicLoading.hide();
  	}, function (error) {
       alert('Unable to get location: ' + error.message);
    });
  }

  $scope.cierraMapa = function() {
    $scope.modal.hide();
  }

})

.controller('controladorPublicar', function($scope, datos, $localstorage, $ionicHistory) {
	$scope.oferta = {};
	$scope.titulo = "Publicar Oferta";

	$scope.publicar = function() {
		datos.guardarOferta($scope.oferta, $localstorage.get("id", undefined));

		$ionicHistory.goBack();
		
		console.log($scope.oferta);
	}
})

;
