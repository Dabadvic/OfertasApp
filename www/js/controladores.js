angular.module('controladoresApp', [])

.controller('controladorOfertas', function($scope) {

  //$scope.ofertas = servicioOfertas.ofertas;
  console.log("Va a cargar los datos");
  
  $scope.ofertas = [
    {nombre:"Bar Pepe", descripcion:"2x1 en cerveza", fin:"Hasta las 22:00", distancia:223},
    {nombre:"Cafetería 4Esquinas", descripcion:"Cafe gratis 20 clientes", fin:"Usos restantes: 13", distancia:358},
    {nombre:"Taverna de Moe", descripcion:"Raciones 3x2", fin:"Hasta las 21:00", distancia:412},
  ];

  console.log("Ha cargado los datos");

  //$scope.ofertas = ["asd","dsa"];

});

/*
.controller('controladorDetalles', function($scope, oferta) {
  $scope.oferta = oferta
});
*/