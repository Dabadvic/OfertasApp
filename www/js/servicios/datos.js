angular.module('servicio.datos', [])

/* Servicio principal que se encarga de manejar las ofertas */
.factory('datos', function($ionicLoading, $ionicHistory) {
  // Básicas para pruebas
  var ofertas = [
    {nombre:"Bar Pepe", descripcion_corta:"2x1 en cerveza", fin:"Hasta las 22:00", distancia:223},
    {nombre:"Cafetería 4Esquinas", descripcion_corta:"Cafe gratis 20 clientes", fin:"Usos restantes: 13", distancia:358},
    {nombre:"Taberna de Moe", descripcion_corta:"Raciones 3x2", fin:"Hasta las 21:00", distancia:412}
  ];

  /* Calcula la listancia entre dos puntos, con latitud y longitud */
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

  /* Pasa de grados a radianes */
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

    /* Carga los datos de la base de datos en internet (Parse), para ello:
        1. Obtiene la ubicación actual del dispositivo (para el cálculo de distancias).
        2. Realiza la petición (query) al servidor indicando que añada el usuario al que pertenece la oferta.
          - También reordena según la distancia

        Con $ionicLoading muestra un mensaje de loading mientras se cargan los datos.
    */ 
    cargarDatos: function() {
      var OfertaObject = Parse.Object.extend("OfertaObject");
      var query = new Parse.Query(OfertaObject);
      ofertas = [];

      query.include("usuario");

      var userLat; 
      var userLon;
      navigator.geolocation.getCurrentPosition(function (pos) { // Obtener la ubicación
        console.log('Got pos', pos);
        userLat = pos.coords.latitude; 
        userLon = pos.coords.longitude;

        $ionicLoading.show({
          template: 'loading'
        });

        query.find({  // Petición query
          success: function(results) {
            // Por cada elemento devuelto, se guarda en ofertas
            for(var i=0; i < results.length; i++) {
              var user = results[i].get("usuario");
              
              ofertas.push({
                nombre: user.get("local"),//results[i].get("local"),
                descripcion_corta: results[i].get("descripcion_corta"),
                descripcion: results[i].get("descripcion"),
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

    },

    guardarUsuario: function(usuario) {
      var UserObject = Parse.Object.extend("UserObject");
      var query = new Parse.Query(UserObject);

      // Para comprobar la existencia del usuario, de momento sólo se permite una cuenta por email 
      query.equalTo("email", usuario.email);

      query.find({
          success: function(results) {
            if (results.length > 0) {
                // El usuario ya existe
            console.log("Usuario existente");
            alert("Usuario existente");
          } else {
            // Crea el usuario si no existe

              console.log('Registrando usuario: ', usuario.nombre);
              var user = new UserObject();
              
              user.set("nombre", usuario.nombre);
              user.set("password", usuario.password);
              user.set("apellidos", usuario.apellidos);
              user.set("email", usuario.email);
              user.set("local", usuario.local);
              user.set("latitud", usuario.localizacion.latitud);
              user.set("longitud", usuario.localizacion.longitud);

              user.save(null, {});

          $ionicLoading.show({ template: 'Usuario registrado', noBackdrop: true, duration: 2000 });

          $ionicHistory.goBack();
          return true;
          }
        },
          error: function(error) {
              // Error
              return false;
        }
      });
    },

    guardarOferta: function(oferta, usuario) {
      var OfertaObject = Parse.Object.extend("OfertaObject");

      console.log('Registrando oferta: ', usuario.nombre);
      var ofer = new OfertaObject();
              
      ofer.set("descripcion", oferta.descripcion);
      ofer.set("descripcion_corta", oferta.descripcion_corta);
      ofer.set("duracion", oferta.duracion);
      ofer.set("usos", oferta.usos);

      var UserObject = Parse.Object.extend("UserObject");
      var query = new Parse.Query(UserObject);
      query.get(usuario, {
          success: function(user) {
            ofer.set("usuario", user);
            ofer.save(null, {
              success: function(gameScore) {
                $ionicLoading.show({ template: 'Oferta creada', noBackdrop: true, duration: 2000 });
              },
              error: function(gameScore, error) {
                alert('Failed to create new object, with error code: ' + error.message);
              }
            });
          },
          error: function(object, error) {
            
          }
      });
    },
  }
})

.factory('$localstorage', ['$window', function($window) {
  return {

    // Clear everything !!! ------------
    clear: function() {
      $window.localStorage.clear();
    },

    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}])

;