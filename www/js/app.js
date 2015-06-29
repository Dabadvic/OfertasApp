// Se indica el nombre del módulo y un array de los componentes que requiere
angular.module('ofertasApp', ['ionic', 'controladores.ofertas', 'controlador.Preferencias', 'controlador.Registro', 'controlador.editar'])

// Este lo trae así por defecto
.run(function($ionicPlatform) {

  

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // Preparar Parse con la ID de la aplicación y la clave de JavaScript (ambas en la web)
    Parse.initialize("4R2V91bSep94FYqbspK1UkLIAL2Kd5IQJFCmZsMB", "aaHJB3mLTT2UmgaUyEvn2PQKBpO60WQDFqWNTodO");
    /*
    // Rest call to Parse to Insert/Update the Installation record for this Device
                $http({
                    url: "https://api.parse.com/1/installations",
                    method: "POST",
                    data: {"deviceType": "android",
                           "installationId": CommonService.parseInstallationId,
                           "gcmRegId": e.regid,
                           "testdevice": tester,
                           "channels": [""] },
                    headers:  {"X-Parse-Application-Id": CommonService.parse_appkey,
                               "X-Parse-REST-API-Key": CommonService.parse_restkey,
                               "Content-Type": "application/json"}
                }).success(function (data, status, headers, config) {
                    LogService.add("GCM RegID: " + e.regid);
                    LogService.add("GCM Parse InstallationID: " + CommonService.parseInstallationId);
                        //alert('GCM registered success = ' + data + ' Status ' + status); 
                }).error(function (data, status, headers, config) {
                        //alert('GCM registered failure = ' + data + ' Status ' + status);
                });
*/

//-------------------------------------------------------------------------------
var applicationId = "4R2V91bSep94FYqbspK1UkLIAL2Kd5IQJFCmZsMB";
var clientKey = "BWlU4AtdgyJsSLklJTYN4nk9cWpQNeuXZPxbALtp";
//call registerAsPushNotificationClient internally
  window.parse.setUp(applicationId, clientKey);
  
  //registerAsPushNotificationClient callback
  window.parse.onRegisterAsPushNotificationClientSucceeded = function() {
    alert('Registrado como cliente en notificaciones');
  };
  window.parse.onRegisterAsPushNotificationClientFailed = function() {
    alert('Registro fallido');
  };
  
  //subscribe callback
  window.parse.onSubscribeToChannelSucceeded = function() {
    alert('Suscrito a canal');
  };
  window.parse.onSubscribeToChannelFailed = function() {
    alert('Suscrito fallido');
  };  
  //unsubscribe callback
  window.parse.onUnsubscribeSucceeded = function() {
    alert('Cancelada suscripción a canal');
  };
  window.parse.onUnsubscribeFailed = function() {
    alert('Cancelada fallida');
  };  
//-------------------------------------------------------------------------------

  });
})

// Para la navegación entre vistas
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/')

// Vista principal, que es la que se carga si no hay nada (especificado en el otherwise)
  $stateProvider.state('ofertas', {
    url: '/',
    templateUrl: 'templates/main.html',
    controller: 'controladorOfertas'
  })

// Vista con las preferencias de usuario
  $stateProvider.state('preferencias', {
    url: '/settings',
    templateUrl: 'templates/preferencias.html',
    controller: 'controladorPreferencias'
  })

// Vista con el registro de usuario
  $stateProvider.state('registro', {
    url: '/settings/registro',
    templateUrl: 'templates/registro.html',
    controller: 'controladorRegistro'
  })

  // Vista con el mapa para la elección de lugar
  $stateProvider.state('mapa', {
    url: '/settings/registro/mapa',
    templateUrl: 'templates/mapa.html',
    controller: 'controladorMapa'
  })

  // Vista para editar el perfil de un usuario (basada en la vista de registro)
  $stateProvider.state('editarPerfil', {
    url: '/settings/editarperfil',
    templateUrl: 'templates/registro.html',
    controller: 'controladorEditarPerfil'
  })

  // Vista para publicar una oferta
  $stateProvider.state('publicarOferta', {
    url: '/settings/publicaoferta?oferta',
    templateUrl: 'templates/publicar_oferta.html',
    controller: 'controladorPublicar',
    resolve: {
      oferta: function($stateParams) {
        if ($stateParams.oferta) {
          var obj = JSON.parse($stateParams.oferta);
          return obj;
        } else {
          return undefined;
        }
      }
    }
  })

  // Vista con el listado de ofertas publicadas por un usuario
  $stateProvider.state('ofertasPersonales', {
    url: '/settings/ofertaspersonales',
    templateUrl: 'templates/ofertas_publicadas.html',
    controller: 'controladorOfertasPublicadas'
  })

// Vista que lleva al detalle de una oferta concreta
  $stateProvider.state('detalle', {
    url: '/:ofertaId',
    templateUrl: 'templates/oferta.html',
    controller: 'controladorDetalles',
    resolve: {
      oferta: function($stateParams, datos) {
        return datos.getOferta($stateParams.ofertaId)
      }
    }
  })

// Vista con el detalle de una oferta publicada
  $stateProvider.state('detallePublicada', {
    url: '/:oferta',
    templateUrl: 'templates/oferta.html',
    controller: 'controladorDetallesPublicada',
    resolve: {
      oferta: function($stateParams) {
        var obj = JSON.parse($stateParams.oferta);
        return obj;
      }
    }
  })
});