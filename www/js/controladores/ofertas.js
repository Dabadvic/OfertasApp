angular.module('controladores.ofertas', ['servicio.datos', 'servicio.mapas'])

.controller('controladorOfertas', function($scope, datos, $state, $localstorage) {
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

.controller('controladorDetalles', function($scope, oferta) {
  $scope.oferta = oferta;
});
