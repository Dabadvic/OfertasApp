angular.module('controladores.ofertas', ['servicio.datos', 'servicio.mapas', 'ionic'])

.controller('controladorOfertas', function($scope, datos, $state, $localstorage, $ionicLoading) {
  $scope.ofertas = datos.getOfertas();

  $scope.$on('$ionicView.beforeEnter', function() {
	$scope.nombre = $localstorage.get("user", "");

	if ($localstorage.get("notificaciones", true) == "true")
		window.parse.subscribeToChannel('news');
	else
		window.parse.unsubscribe('news');

  })

  $scope.preferencias = function() {
	$state.go('preferencias');
  }

  $scope.recargarDatos = function() {
  	console.log("Va a recargar los datos");
  	datos.cargarDatos();
  	$scope.ofertas = datos.getOfertas();

/*
  	// Pruebas con notificaciones push
  	Parse.Push.send({
	  channels: [ "news" ],
	  data: {
	    alert: "Mandado desde pc"
	  }
	},{});
*/
  }

})

.controller('controladorBarra', function ($scope, $ionicHistory) {
  	$scope.atras = function() {
    	$ionicHistory.goBack();
  	};
})


.controller('controladorDetalles', function($scope, oferta, $ionicModal, $compile, $ionicLoading) {
  $scope.oferta = oferta;

  $scope.$on('$ionicView.beforeEnter', function() {
    	$scope.textoCanjear = "Canjear";
    	$scope.textoComoLlegar = "Como Llegar";
  	})

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

.controller('controladorPublicar', function($scope, datos, oferta, $localstorage, $ionicHistory, $ionicLoading) {
	if (oferta != undefined) {
		$scope.oferta = {};
		$scope.oferta.id = oferta.id;
		$scope.oferta.descripcion = oferta.descripcion;
		$scope.oferta.descripcion_corta = oferta.descripcion_corta;
		$scope.oferta.duracion = new Date(oferta.duracion);
		$scope.oferta.usos = oferta.usos;

		$scope.titulo = "Editar oferta";
	} else {
		$scope.oferta = {};
		$scope.titulo = "Publicar oferta";
	}

	$scope.publicar = function() {
		if ($scope.oferta.id != undefined) {
			datos.actualizarOferta($scope.oferta);
			// Retroceder dos vistas
			// get the right history stack based on the current view
		    var historyId = $ionicHistory.currentHistoryId();
		    var history = $ionicHistory.viewHistory().histories[historyId];
		    // set the view 'depth' back in the stack as the back view
		    var targetViewIndex = history.stack.length - 1 - 3;
		    $ionicHistory.backView(history.stack[targetViewIndex]);
		    // navigate to it
		    $ionicHistory.goBack();

		} else {
			datos.guardarOferta($scope.oferta, $localstorage.get("id", undefined));
			$ionicHistory.goBack();
		}
	}
})


.controller('controladorOfertasPublicadas', function($scope, datos, $localstorage, $ionicHistory, $ionicLoading) {
	$scope.$on('$ionicView.beforeEnter', function() {
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
                  usos: results[i].get("usos"),
                  id: results[i].id
                });
            }
          }

          // Ordena ofertas por vigentes y caducadas
          for(var i = 0; i < ofertas.length; i++) {
          	var duracion = ofertas[i].duracion;
          	if (duracion)
          		ofertas[i].fin = duracion.getHours() + ":" + ((duracion.getMinutes().toString().length == 1) ? "0" + duracion.getMinutes() : duracion.getMinutes())
          					+ " " + duracion.getDate() + "/" + (duracion.getMonth()+1) + "/" + duracion.getFullYear();
          	else
          		ofertas[i].fin = "Marcada por usos";
          	
          	if(ofertas[i].duracion != undefined && Date.parse(ofertas[i].duracion) < Date.parse(hoy)) {
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
})

/* Controlador para los detalles de una pregunta que ya ha sido publicada.
	
	Antes de entrar cambia los nombres en el html
 */
.controller('controladorDetallesPublicada', function($scope, oferta, $state) {
	$scope.oferta = oferta;

	$scope.abreMapa = function() {
		$state.go('publicarOferta', {oferta: JSON.stringify($scope.oferta)});
	}

	$scope.$on('$ionicView.beforeEnter', function() {
    	document.getElementById("imagenCanjearOferta").className = "icon ion-camera";
    	document.getElementById("imagenComoLlegarOferta").className = "icon ion-document-text";
    	$scope.textoCanjear = "Escanear";
    	$scope.textoComoLlegar = "Editar";
  	})
})

;