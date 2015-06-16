// Se indica el nombre del módulo y un array de los componentes que requiere
angular.module('ofertasApp', ['ionic', 'controladoresApp'])

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
  });
})

// Para la navegación entre vistas
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/')
  
  console.log("Carga vista");

// Vista principal, que es la que se carga si no hay nada (especificado en el otherwise)
  $stateProvider.state('ofertas', {
    url: '/',
    templateUrl: 'templates/main.html',
    controller: 'controladorOfertas'
  })

  $stateProvider.state('detalle', {
    url: '/oferta',
    templateUrl: 'templates/oferta.html',
  })

// Vista que lleva al detalle de una oferta concreta
/*
  $stateProvider.state('detalle', {
  url: '/:oferta',
  templateUrl: 'templates/oferta.html',
  controller: 'controladorDetalles',
  resolve: {
    oferta: function($stateParams, servicioOfertas) {
      return servicioOfertas.getOferta($stateParams.oferta)
    }
  }
  })
*/
})
