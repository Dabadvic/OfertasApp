angular.module('serviciosApp', [])

/* Servicio principal que se encarga de manejar las ofertas */
.factory('servicioOfertas', function($ionicLoading) {
  // Básicas para pruebas
  var ofertas = [
    {nombre:"Bar Pepe", descripcion:"2x1 en cerveza", fin:"Hasta las 22:00", distancia:223},
    {nombre:"Cafetería 4Esquinas", descripcion:"Cafe gratis 20 clientes", fin:"Usos restantes: 13", distancia:358},
    {nombre:"Taberna de Moe", descripcion:"Raciones 3x2", fin:"Hasta las 21:00", distancia:412}
  ];


  function distancia(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    d = d * 1000; // Distancia a metros
    return Math.round(d); //La devuelve redondeada
  };

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  };

  return {
    getOfertas: function() {
      return ofertas;
    },
    getOferta: function(index) {
      return ofertas[index];
    },
    cargarDatos: function() {
      var OfertaObject = Parse.Object.extend("OfertaObject");
      var query = new Parse.Query(OfertaObject);
      ofertas = [];

      query.include("usuario");

      var userLat; 
      var userLon;
      navigator.geolocation.getCurrentPosition(function (pos) {
        console.log('Got pos', pos);
        userLat = pos.coords.latitude; 
        userLon = pos.coords.longitude;

        $ionicLoading.show({
          template: 'loading'
        });

        query.find({
          success: function(results) {
            // Por cada elemento devuelto, se guarda en ofertas
            for(var i=0; i < results.length; i++) {
              var user = results[i].get("usuario");
              ofertas.push({
                nombre: results[i].get("local"),
                descripcion: results[i].get("descripcion_corta"),
                fin: results[i].get("fin"),
                distancia: distancia(
                  userLat, userLon, 
                  user.get("latitud"),user.get("longitud")
                  )
              });
            }

            ofertas.sort(function(a, b){
              return (a.distancia - b.distancia);
            });

            $ionicLoading.hide();
          },

          error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
            alert("No leo de la base de datos");
          }
        });
        
      }, function (error) {
        alert('Unable to get location: ' + error.message);
      });

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
    },
  }
});