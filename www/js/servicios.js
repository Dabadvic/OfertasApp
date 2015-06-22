angular.module('serviciosApp', [])

.factory('servicioOfertas', function() {
  /*
  var ofertas = [
    {nombre:"Bar Pepe", descripcion:"2x1 en cerveza", fin:"Hasta las 22:00", distancia:223},
    {nombre:"Cafetería 4Esquinas", descripcion:"Cafe gratis 20 clientes", fin:"Usos restantes: 13", distancia:358},
    {nombre:"Taberna de Moe", descripcion:"Raciones 3x2", fin:"Hasta las 21:00", distancia:412}
  ]
  */

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
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  var OfertaObject = Parse.Object.extend("OfertaObject");
  var query = new Parse.Query(OfertaObject);
  var ofertas = [];

  var UserObject = Parse.Object.extend("UserObject");
/* Util para guardar luego una oferta
  var query2 = new Parse.Query(UserObject);

  query2.equalTo("email", "user");
  query2.first({
    success: function(usuario) {
      var ofer = new OfertaObject();
      ofer.set("local", "Bar tal");
      ofer.set("descripcion", "2x1 churros acompañado con un amigo o familiar");
      ofer.set("descripcion_corta", "2x1 churros");
      ofer.set("fin", "Usos restantes: 3");
      ofer.set("usuario", usuario);
      ofer.set("latitud", "37.7767533");
      ofer.set("longitud", "-3.78804480");
      ofer.save(null, {});
    },

    error: function(error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });
*/
  query.include("usuario");

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
            37.7757533,-3.7880248000000165, 
            user.get("latitud"),user.get("longitud")
            )
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