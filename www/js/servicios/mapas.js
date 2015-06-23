angular.module('servicio.mapas', [])

/* Servicio usado para guardar los datos que el usuario elige al registrarse */
.factory('geodatos', function() {
  var lat;
  var lon;
  var jqObj;
  var jqLat;
  var jqLon;

  return {
    creaMapa: function(jqObjeto, jqLatitud, jqLongitud) {
      jqObjeto.locationpicker({
        location: {latitude: 0, longitude: 0}, 
        radius: 0,
        inputBinding: {
              latitudeInput: jqLatitud,
              longitudeInput: jqLongitud,
          }
      });
      jqObj = jqObjeto;
      jqLat = jqLatitud;
      jqLon = jqLongitud;
    },

    cambiaPosicion: function(latitud, longitud) {
      lat = latitud;
      lon = longitud;
      jqObj.locationpicker({
        location: {latitude: latitud, longitude: longitud}, 
        radius: 0,
        inputBinding: {
              latitudeInput: jqLat,
              longitudeInput: jqLon,
          }
      });
    },

    setLocalizacion: function(latitud, longitud) {
      lat = latitud;
      lon = longitud;
    },

    getLocalizacion: function() {
      return {latitud: lat, longitud: lon};
    },

  }
})

;