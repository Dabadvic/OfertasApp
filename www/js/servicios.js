angular.module('serviciosApp', [])

.factory('servicioOfertas', function() {
  /*
  var ofertas = [
    {nombre:"Bar Pepe", descripcion:"2x1 en cerveza", fin:"Hasta las 22:00", distancia:223},
    {nombre:"Cafetería 4Esquinas", descripcion:"Cafe gratis 20 clientes", fin:"Usos restantes: 13", distancia:358},
    {nombre:"Taberna de Moe", descripcion:"Raciones 3x2", fin:"Hasta las 21:00", distancia:412}
  ]
  */

  var OfertaObject = Parse.Object.extend("OfertaObject");
  var query = new Parse.Query(OfertaObject);
  var ofertas = [];

  query.find({
    success: function(results) {
      // Por cada elemento devuelto, se guarda en ofertas
      for(var i=0; i < results.length; i++) {
        ofertas.push({
          nombre: results[i].get("local"),
          descripcion: results[i].get("descripcion_corta"),
          fin: results[i].get("fin"),
          distancia: 250
        });
      }
    },

    error: function(error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });

  return {
    ofertas: ofertas,
    getOferta: function(index) {
      return ofertas[index];
    }
  }
})

.factory('geodatos', function() {
  var lat;
  var lon;

  return {
    setLocalizacion: function(latitud, longitud) {
      lat = latitud;
      lon = longitud;
    },
    getLocalizacion: function() {
      return {latitud: lat, longitud: lon};
    }
  }
});