/**
 * @file Servicio utilizado para el uso de los datos internos de la aplicación y conexión con Parse
 * @author David Abad Vich <davidabad10@gmail.com>
 * @version 6.1
*/

angular.module('servicio.datos', [])

/**
   * Variable usada para manejar datos en memoria local (permanente en el dispositivo).
   * @ngdoc factory
   * @namespace $localstorage
   * @requires $window
   */
.factory('$localstorage', ['$window', function($window) {
  return {

    /**
     * Borra todos los datos que hay en la memoria local.
     * @function clear
     * @memberof $localstorage
     * @inner
     */
    clear: function() {
      $window.localStorage.clear();
    },

    /**
     * Guarda un único valor en memoria local.
     * @function set
     * @property {string} key Cadena con el nombre que va a tener el valor en memoria local
     * @property {type} value Valor asignado
     * @memberof $localstorage
     * @inner
     */
    set: function(key, value) {
      $window.localStorage[key] = value;
    },

    /**
     * Obtiene un único valor de la memoria local. Si no existe, devuelve uno por defecto.
     * @function get
     * @property {string} key Cadena con el nombre que tiene el valor
     * @property {type} defaultValue Valor asignado por defecto
     * @return Valor de la variable o valor por defecto.
     * @memberof $localstorage
     * @inner
     */
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },

    /**
     * Guarda un objeto en memoria local.
     * @function setObject
     * @property {string} key Cadena con el nombre que va a tener el valor en memoria local
     * @property {object} value Objeto asignado
     * @memberof $localstorage
     * @inner
     */
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },

    /**
     * Carga un objeto de la memoria local. Si no existe, devuelve un objeto vacío.
     * @function getObject
     * @property {string} key Cadena con el nombre que tiene el valor en memoria local
     * @return Objeto con el valor del objeto guardado o un objeto vacío.
     * @memberof $localstorage
     * @inner
     */
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}])

/**
   * Servicio principal que se encarga de manejar las ofertas.
   * @ngdoc service
   * @name Servicio datos
   * @namespace Servicio datos
   * @requires $ionicLoading
   * @requires $ionicHistory
   * @requires $localstorage
   * @requires $timeout
   */
/* Servicio principal que se encarga de manejar las ofertas */
.factory('datos', function($ionicLoading, $ionicHistory, $localstorage, $timeout) {
  var ofertas = $localstorage.getObject("ultimasOfertas");
/*
  // Básicas para pruebas
  var ofertas = [
    {nombre:"Bar Pepe", descripcion_corta:"2x1 en cerveza", fin:"Hasta las 22:00", distancia:223},
    {nombre:"Cafetería 4Esquinas", descripcion_corta:"Cafe gratis 20 clientes", fin:"Usos restantes: 13", distancia:358},
    {nombre:"Taberna de Moe", descripcion_corta:"Raciones 3x2", fin:"Hasta las 21:00", distancia:412}
  ];
*/

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

  /* Obtiene el texto que se mostrará al usuario como fin de la oferta */
  function obtenerFin(duracion, usos) {
    var fin = "";
      if (usos != undefined) {
        fin += "Usos: " + usos;
      }
      if (duracion != undefined) {
        fin += " Hasta " + duracion.getHours() + ":" + ((duracion.getMinutes().toString().length == 1) ? "0" + duracion.getMinutes() : duracion.getMinutes());
      }

      return fin;
  };

  /* Función que escapa caracteres especiales */
  function rfc3986EncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, escape);
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
    /**
     * Carga los datos de la base de datos en internet (Parse).
     * @function cargarDatos
     * @return Array con las ofertas que se encuentran dentro del radio de alcance.
     * @memberof Servicio datos
     * @inner
     */
    cargarDatos: function(userLat, userLon) {
      var promesa = new Parse.Promise();
      var hoy = new Date();
      var OfertaObject = Parse.Object.extend("OfertaObject");
      var query = new Parse.Query(OfertaObject);

      ofertas = [];

      query.include("usuario");

/*
      var userLat; 
      var userLon;
      navigator.geolocation.getCurrentPosition(function (pos) { // Obtener la ubicación
        userLat = pos.coords.latitude; 
        userLon = pos.coords.longitude;
        console.log(pos);
*/
        console.log("cargarDatos: Hace query");

        query.find().then(
            function(results) {
                var hay_ofertas = "no";
                    // Por cada elemento devuelto, se guarda en ofertas
                    for(var i=0; i < results.length; i++) {
                      var user = results[i].get("usuario");
                      
                      var duracion = results[i].get("duracion") == undefined ? undefined : new Date(results[i].get("duracion"));
                      var usos = results[i].get("usos");
                      var distancia_oferta = distancia( userLat, userLon, user.get("latitud"),user.get("longitud") );

                      if (distancia_oferta < 1000) {
                          if (duracion == undefined && usos > 0) {
                              hay_ofertas = "si";
                              ofertas.push({
                                nombre: user.get("local"),//results[i].get("local"),
                                descripcion_corta: results[i].get("descripcion_corta"),
                                descripcion: results[i].get("descripcion"),
                                fin: obtenerFin(duracion, usos),
                                duracion: duracion,
                                usos: usos,
                                distancia: distancia(
                                  userLat, userLon, 
                                  user.get("latitud"),user.get("longitud")
                                  ),
                                latitud: user.get("latitud"),
                                longitud: user.get("longitud"),
                                id: results[i].id
                              });
                          } else if (duracion != undefined) {
                              if ((duracion.getHours() >= hoy.getHours()) && (Date.parse(duracion) > Date.parse(hoy))) {
                                  hay_ofertas = "si";
                                  ofertas.push({
                                    nombre: user.get("local"),//results[i].get("local"),
                                    descripcion_corta: results[i].get("descripcion_corta"),
                                    descripcion: results[i].get("descripcion"),
                                    fin: obtenerFin(duracion, usos),
                                    duracion: duracion,
                                    usos: usos,
                                    distancia: distancia(
                                      userLat, userLon, 
                                      user.get("latitud"),user.get("longitud")
                                      ),
                                    latitud: user.get("latitud"),
                                    longitud: user.get("longitud"),
                                    id: results[i].id
                                  });
                              }
                          }
                      }

                    }

                    $localstorage.set("hay_ofertas", hay_ofertas);

                    ofertas.sort(function(a, b){
                      return (a.distancia - b.distancia);
                    });


                    $localstorage.setObject("ultimasOfertas", ofertas);

                    promesa.resolve("éxito");
                    
            },
            function(error){
                console.log("Error: " + error.code + " " + error.message);
                alert("No leo de la base de datos");
                $ionicLoading.hide();
                promesa.reject(error);
            })
/*
      }, function (error) {
        alert('No se ha podido obtener la localización');
        console.log(error);
        $localstorage.set("hay_ofertas", 'false');
        $ionicLoading.hide();
        promesa.reject(error);
      });
      */
      return promesa;
    },

    /**
     * Guarda un nuevo usuario en la base de datos de Parse.
     * @function guardarUsuario
     * @property {Usuario} usuario Objeto con los datos de un usuario para registrar
     * @memberof Servicio datos
     * @inner
     */
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
              console.log(rfc3986EncodeURIComponent(usuario.local));
              user.set("nombre", usuario.nombre);
              user.set("password", usuario.password);
              user.set("apellidos", usuario.apellidos);
              user.set("email", usuario.email);
              user.set("local", rfc3986EncodeURIComponent(usuario.local));
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

    /**
     * Guarda una nueva oferta en la base de datos de Parse y envía una notificación push.
     * @function guardarOferta
     * @property {Oferta} oferta Objeto con los datos de la oferta que se va a registrar
     * @property {Usuario} usuario Objeto con los datos del usuario que guarda la oferta
     * @memberof Servicio datos
     * @inner
     */
    guardarOferta: function(oferta, usuario) {
      var OfertaObject = Parse.Object.extend("OfertaObject");

      console.log('Registrando oferta: ', usuario);
      var ofer = new OfertaObject();
              
      ofer.set("descripcion", oferta.descripcion);
      ofer.set("descripcion_corta", oferta.descripcion_corta);
      ofer.set("duracion", oferta.duracion);
      ofer.set("usos", oferta.usos);
      ofer.set("veces_usada", 0);

      var UserObject = Parse.Object.extend("UserObject");
      var query = new Parse.Query(UserObject);
      query.get(usuario, {
          success: function(user) {
            ofer.set("usuario", user);
            ofer.save(null, {
              success: function(off) {
                $ionicLoading.show({ template: 'Oferta creada', noBackdrop: true, duration: 2000 });
                
                var mensaje = {
                  nombre: user.get("local"),
                  descripcion_corta: oferta.descripcion_corta,
                  descripcion: oferta.descripcion,
                  fin: obtenerFin(oferta.duracion, oferta.usos),
                  duracion: oferta.duracion,
                  usos: oferta.usos,
                  //"distancia":819,
                  latitud: user.get("latitud"),
                  longitud: user.get("longitud"),
                  id: off.id
                };

                  var pushQuery = new Parse.Query(Parse.Installation);
                  var punto = new Parse.GeoPoint(parseFloat(mensaje.latitud), parseFloat(mensaje.longitud));
                  pushQuery.withinKilometers("location", punto, 1);
                  pushQuery.equalTo("channels", "news");

                    // Primera notificación
                    Parse.Push.send({
                      where: pushQuery,
                      data: {
                        alert: "Nueva oferta: " + oferta.descripcion_corta,
                        oferta: JSON.stringify(mensaje)
                      }
                    }, {
                      success: function () {
                        console.log("Oferta enviada");
                      },
                      error: function (error) {
                        console.log(error);
                      }
                    });

                    // Resto de notificaciones
                    $timeout(function(){
                      var segundaQuery = new Parse.Query(Parse.Installation);
                      segundaQuery.withinKilometers("location", punto, 1);
                      segundaQuery.doesNotMatchKeyInQuery("deviceToken", "deviceToken", pushQuery);
                      pushQuery.equalTo("channels", "news");

                      Parse.Push.send({
                        where: segundaQuery,
                        data: {
                          alert: "Oferta: " + oferta.descripcion_corta,
                          oferta: JSON.stringify(mensaje)
                        }
                      }, {
                        success: function () {
                          console.log("Oferta enviada");
                        },
                        error: function (error) {
                          console.log(error);
                        }
                      });
                    }, 900000);
                    
              },
              error: function(off, error) {
                alert('Failed to create new object, with error code: ' + error.message);
              }
            });
          },
          error: function(object, error) {
            
          }
      });
    },

    /**
     * Actualiza una oferta existente en la base de datos de Parse.
     * @function actualizarOferta
     * @property {Oferta} oferta Objeto con los datos de la oferta que se va a actualizar
     * @memberof Servicio datos
     * @inner
     */
    actualizarOferta: function(oferta) {
      var OfertaObject = Parse.Object.extend("OfertaObject");
      var query = new Parse.Query(OfertaObject);

      console.log('Actualizando oferta');

      query.get(oferta.id, {
          success: function(ofer) {
            ofer.set("descripcion", oferta.descripcion);
            ofer.set("descripcion_corta", oferta.descripcion_corta);
            ofer.set("duracion", oferta.duracion);
            ofer.set("usos", oferta.usos);

            ofer.save(null, {
              success: function(gameScore) {
                $ionicLoading.show({ template: 'Oferta actualizada', noBackdrop: true, duration: 2000 });
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

    /**
     * Borra una oferta existente en la base de datos de Parse.
     * @function borrarOferta
     * @property {Oferta} oferta Objeto con los datos de la oferta que se va a borrar
     * @memberof Servicio datos
     * @inner
     */
    borrarOferta: function(oferta) {
      var OfertaObject = Parse.Object.extend("OfertaObject");
      var query = new Parse.Query(OfertaObject);

      console.log('Borrando oferta');

      query.get(oferta.id, {
          success: function(ofer) {
            ofer.destroy({});
            $ionicLoading.show({ template: 'Oferta borrada', noBackdrop: true, duration: 2000 });
          },
          error: function(object, error) {
            
          }
      });
    },
  }
})

;