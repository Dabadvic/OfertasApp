// Se indica el nombre del módulo y un array de los componentes que requiere
angular.module('ofertasApp', ['ionic', 'controladores.ofertas', 'controlador.Preferencias', 'controlador.Registro', 'controlador.editar', 'ngCordova'])

// Este lo trae así por defecto
.run(function($ionicPlatform, $localstorage, $cordovaPush, $rootScope) {

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

      // Inicializar el plugin para notificaciones push
      window.onNotification = function(e) {
        console.log(e);
        switch( e.event )
          {
          case 'registered':
              if ( e.regid.length > 0 )
              {
                  // Your GCM push server needs to know the regID before it can push to this device
                  // here is where you might want to send it the regID for later use.
                  console.log("regID = " + e.regid);
              }
          break;

          case 'message':
              // if this flag is set, this notification happened while we were in the foreground.
              // you might want to play a sound to get the user's attention, throw up a dialog, etc.
              if ( e.foreground )
              {
                console.log("Inline");
              }
              else
              {  // otherwise we were launched because the user touched a notification in the notification tray.
                  if ( e.coldstart )
                  {
                    alert("Coldstart");
                  }
                  else
                  {
                    alert("Background");
                  }
              }

              console.log(e.payload.message);
          break;

          case 'error':
              console.log("Error indefinido");
          break;

          default:
              console.log("Default");
          break;
        }
      }

      // result contains any message sent from the plugin call
      function successHandler (result) {
          console.log('result = ' + result);
      }

      // result contains any error description text returned from the plugin call
      function errorHandler (error) {
          console.log('error = ' + error);
      }
/*
      var pushNotification;
      document.addEventListener("deviceready", function(){
        pushNotification = window.plugins.pushNotification;
        pushNotification.register(
        successHandler,
        errorHandler,
        {
            "senderID":"792773052245",
            "ecb":"onNotification"
        });
      });
*/

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
            
            window.ParsePushPlugin.subscribe('news', function(msg) {
                console.log('Suscrito a news');
            }, function(e) {
                alert('error');
            });

            window.ParsePushPlugin.on('receivePN', function(pn){
              console.log('Recibida notificacion');
              console.log(pn);
            });

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
  $urlRouterProvider.otherwise('/')

// Vista principal, que es la que se carga si no hay nada (especificado en el otherwise)
  $stateProvider.state('ofertas', {
    url: '/:oferta',
    templateUrl: 'templates/main.html',
    controller: 'controladorOfertas',
    resolve: {
      oferta: function($stateParams) {
        if ($stateParams.oferta) {
          console.log("Iniciando con oferta");
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
        //return datos.getOferta($stateParams.ofertaId)
        console.log($stateParams.oferta);
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