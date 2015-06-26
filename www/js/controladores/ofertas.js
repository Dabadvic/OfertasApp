angular.module('controladores.ofertas', ['servicio.datos', 'servicio.mapas', 'ionic'])

.controller('controladorOfertas', function($scope, datos, $state, $localstorage, $ionicLoading) {
  $scope.ofertas = datos.getOfertas();

  console.log("Carga main");

  $scope.$on('$ionicView.beforeEnter', function() {
	$scope.nombre = $localstorage.get("user", "");
  })

  $scope.preferencias = function() {
	console.log("Cambia vista a preferencias");
	$state.go('preferencias');
  }

  $scope.recargarDatos = function() {
  	console.log("Se van a recargar los datos");
  	datos.cargarDatos();
  	$scope.ofertas = datos.getOfertas();
  }

})

.controller('controladorBarra', function ($scope, $ionicHistory) {
  	$scope.atras = function() {
    	$ionicHistory.goBack();
  	};
})


.controller('controladorDetalles', function($scope, oferta, $ionicModal, $compile, $ionicLoading) {
  $scope.oferta = oferta;

  $scope.mapControl = {
  };

  // Crear la ventana modal que usaremos para el mapa
  $ionicModal.fromTemplateUrl('templates/mapa_modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.abreMapa = function() {
  	$scope.modal.show();

  	$ionicLoading.show({
        template: 'loading'
    });

  	navigator.geolocation.getCurrentPosition(function (pos) {
  		$scope.mapControl.calcRoute(pos.coords.latitude, pos.coords.longitude, oferta.latitud, oferta.longitud);
  		$ionicLoading.hide();
  	}, function (error) {
       alert('Unable to get location: ' + error.message);
    });
  }

  $scope.cierraMapa = function() {
    $scope.modal.hide();
  }

})

.controller('controladorPublicar', function($scope, datos, $localstorage, $ionicHistory) {
	$scope.oferta = {};
	$scope.titulo = "Publicar Oferta";

	$scope.publicar = function() {
		datos.guardarOferta($scope.oferta, $localstorage.get("id", undefined));

		$ionicHistory.goBack();
		
		console.log($scope.oferta);
	}
})


.controller('controladorOfertasPublicadas', function($scope, datos, $localstorage, $ionicHistory, $ionicLoading) {
	var OfertaObject = Parse.Object.extend("OfertaObject");
    var query = new Parse.Query(OfertaObject);
    var ofertas = [];
    var hoy = new Date();
    $scope.vigentes = [];
    $scope.caducadas = [];
    var usuarioId = $localstorage.get("id", undefined);

    query.include("usuario");

    $ionicLoading.show({
        template: 'loading'
    });

        query.find({  // Petición query
          success: function(results) {
            // Por cada elemento devuelto, se guarda en ofertas
          for(var i=0; i < results.length; i++) {
            var user = results[i].get("usuario");
              
            if(usuarioId == user.id) {
                ofertas.push({
                  descripcion_corta: results[i].get("descripcion_corta"),
                  descripcion: results[i].get("descripcion"),
                  duracion: results[i].get("duracion"),
                  usos: results[i].get("usos")
                });
            }
          }

          // Ordena ofertas por vigentes y caducadas
          for(var i = 0; i < ofertas.length; i++) {
          	var duracion = ofertas[i].duracion;
          	ofertas[i].fin = duracion.getHours() + ":" + ((duracion.getMinutes().toString().length == 1) ? "0" + duracion.getMinutes() : duracion.getMinutes())
          					+ " " + duracion.getDate() + "/" + (duracion.getMonth()+1) + "/" + duracion.getFullYear();
          	if(Date.parse(ofertas[i].duracion) < Date.parse(hoy)) {
          		$scope.caducadas.push(ofertas[i]);
          	} else {
          		$scope.vigentes.push(ofertas[i]);
          	}
          }

            $ionicLoading.hide();
          },

          error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
            alert("No leo de la base de datos");
          }
        });
})
;