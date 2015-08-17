// Se indica el nombre del módulo y un array de los componentes que requiere
angular.module('ofertasApp', ['ionic', 'controladores.ofertas', 'controladores.ofertasPublicadas', 'controlador.Preferencias', 'controlador.Registro', 'controlador.editar', 'ngCordova'])

// Este lo trae así por defecto
.run(function($ionicPlatform, $localstorage, $cordovaPush, $rootScope, $state, $ionicHistory) {

  Parse.initialize("4R2V91bSep94FYqbspK1UkLIAL2Kd5IQJFCmZsMB", "aaHJB3mLTT2UmgaUyEvn2PQKBpO60WQDFqWNTodO");


  $ionicPlatform.registerBackButtonAction(function (event) {
    if($state.current.name=="ofertas"){
      navigator.app.exitApp();
    } else {
      $ionicHistory.goBack();
    }
  }, 100);

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

      if (window.ParsePushPlugin)
        window.ParsePushPlugin.register({}, 
        function() {
            console.log('successfully registered device!');
            $localstorage.set("registrado", true);
            
            window.ParsePushPlugin.getInstallationId(function(id) {
                console.log(id);
            }, function(e) {
                alert('error');
            });
            
            window.ParsePushPlugin.getSubscriptions(function(subscriptions) {
                console.log(subscriptions);
            }, function(e) {
                alert('error');
            });
            
            if($localstorage.get("notificaciones", true)) {
              window.ParsePushPlugin.subscribe('news', function(msg) {
                  console.log('Suscrito a news');
              }, function(e) {
                  alert('error');
              });
            }

            window.ParsePushPlugin.on('receivePN', function(pn){
              console.log('Recibida notificacion');
              console.log(pn);
            });

            var ultimaPosicion = $localstorage.getObject("ultimaPosicionConocida");
            if (ultimaPosicion.latitud != undefined) {
              window.ParsePushPlugin.setLocation(ultimaPosicion.latitud, ultimaPosicion.longitud, function(msg){
                  console.log('Ubicación establecida');
              }, function(e) {
                  console.log('Error en setLocation: ' + e);
              });
            }

        }, function(e) {
            alert('error registering device: ' + e);
        });


//-------------------------------------------------------------------------------
/*
var applicationId = "4R2V91bSep94FYqbspK1UkLIAL2Kd5IQJFCmZsMB";
var clientKey = "BWlU4AtdgyJsSLklJTYN4nk9cWpQNeuXZPxbALtp";
//call registerAsPushNotificationClient internally
  window.parse.setUp(applicationId, clientKey);
  
  //registerAsPushNotificationClient callback
  window.parse.onRegisterAsPushNotificationClientSucceeded = function() {
    //alert('Registrado como cliente en notificaciones');
    console.log('Registrado como cliente en notificaciones');
  };
  window.parse.onRegisterAsPushNotificationClientFailed = function() {
    alert('Registro fallido');
  };
  
  //subscribe callback
  window.parse.onSubscribeToChannelSucceeded = function() {
    //alert('Suscrito a canal');
    console.log('Suscrito a canal');
  };
  window.parse.onSubscribeToChannelFailed = function() {
    alert('Suscrito fallido');
  };  
  //unsubscribe callback
  window.parse.onUnsubscribeSucceeded = function() {
    //alert('Cancelada suscripción a canal');
    console.log('Cancelada suscripción a canal');
  };
  window.parse.onUnsubscribeFailed = function() {
    alert('Cancelada fallida');
  };  
  */
//-------------------------------------------------------------------------------

  });
})

// Para la navegación entre vistas
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('ofertas')

// Vista principal, que es la que se carga si no hay nada (especificado en el otherwise)
  $stateProvider.state('ofertas', {
    url: '/:oferta',
    templateUrl: 'templates/main.html',
    controller: 'controladorOfertas',
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
    url: '/:oferta',
    templateUrl: 'templates/oferta.html',
    controller: 'controladorDetalles',
    resolve: {
      oferta: function($stateParams) {
        var obj = JSON.parse($stateParams.oferta);
        return obj;
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