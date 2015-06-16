angular.module('controladoresApp', ['serviciosApp'])

.controller('controladorOfertas', function($scope, servicioOfertas) {
  $scope.ofertas = servicioOfertas.ofertas;
})

.controller('controladorBarra', function MyCtrl($scope, $ionicHistory) {
  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };
})

.controller('controladorDetalles', function($scope, oferta) {
  $scope.oferta = oferta
});
