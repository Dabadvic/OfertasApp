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

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&',
      control: '='
    },
    link: function ($scope, $element, $attr) {
      var directionsDisplay;
      var directionsService = new google.maps.DirectionsService();
      var map;

      function initialize() {
        directionsDisplay = new google.maps.DirectionsRenderer();
        var mapOptions = {
          center: new google.maps.LatLng(43.07493, -89.381388),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map($element[0], mapOptions);
        directionsDisplay.setMap(map);
  
        $scope.onCreate({map: map});

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }

      $scope.internalControl = $scope.control || {};
      $scope.internalControl.calcRoute = function(lat1, lon1, lat2, lon2) {
        var start = new google.maps.LatLng(lat1,lon1);
        var end = new google.maps.LatLng(lat2,lon2);
        var request = {
            origin:start,
            destination:end,
            travelMode: google.maps.TravelMode.WALKING
        };
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
        });
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
})
;