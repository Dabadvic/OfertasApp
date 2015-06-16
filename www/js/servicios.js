angular.module('serviciosApp', [])

.factory('servicioOfertas', function() {
  var ofertas = [
    {nombre:"Bar Pepe", descripcion:"2x1 en cerveza", fin:"Hasta las 22:00", distancia:223},
    {nombre:"Cafetería 4Esquinas", descripcion:"Cafe gratis 20 clientes", fin:"Usos restantes: 13", distancia:358},
    {nombre:"Taverna de Moe", descripcion:"Raciones 3x2", fin:"Hasta las 21:00", distancia:412}
  ]

  return {
    ofertas: ofertas,
    getOferta: function(index) {
      return ofertas[index];
    }
  }
})