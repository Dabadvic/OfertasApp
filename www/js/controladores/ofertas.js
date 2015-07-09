angular.module('controladores.ofertas', ['servicio.datos', 'servicio.mapas', 'ionic', 'ngCordova'])

.controller('controladorOfertas', function($scope, oferta, datos, $state, $localstorage, $ionicLoading, $cordovaPush, $rootScope, $timeout, $ionicPopup) {
  
  $scope.$on('$ionicView.beforeEnter', function() {
    	if (oferta != undefined) {
		  	console.log("Cambiando a oferta");
		  	$state.go('detalle', {oferta: JSON.stringify(oferta)});
		  	oferta = undefined;
		} else {
			console.log("No hay oferta");
		}

		$scope.nombre = $localstorage.get("user", "");

/*
	if ($localstorage.get("notificaciones", true) == "true")
		window.parse.subscribeToChannel('news');
	else
		window.parse.unsubscribe('news');
*/
  	})

  $scope.ofertas = datos.getOfertas();

  $scope.decode = function(str){
  	return decodeURIComponent(str);
  }

  $scope.preferencias = function() {
	$state.go('preferencias');
  }

  $scope.recargarDatos = function() {
  	compruebaGPS();
  	console.log("Va a recargar los datos");
  	datos.cargarDatos();
  	$scope.ofertas = datos.getOfertas();
  }

function compruebaGPS() {
 // Avisar al usuario de que tiene el GPS desactivado
  	var gpsStatus = "NO";
	navigator.geolocation.getCurrentPosition(function(pos){
		var ultimaPosicion = {latitud: pos.coords.latitude, longitud: pos.coords.longitude};
		$localstorage.setObject("ultimaPosicionConocida", ultimaPosicion);
	    gpsStatus = "OK";

	    if (window.ParsePushPlugin) {
	    	window.ParsePushPlugin.setLocation(ultimaPosicion.latitud, ultimaPosicion.longitud, function(msg){
                  console.log('Ubicación establecida');
              }, function(e) {
                  console.log('Error en setLocation: ' + e);
              });
	    }
	});

	$timeout(function(){
	    if(gpsStatus == "OK")
	    	console.log("Estado del GPS: " + gpsStatus)
	    else
	    	var alertPopup = $ionicPopup.alert({
				title: 'GPS inactivo',
				template: 'Es posible que el GPS esté desactivado o haya sido recientemente activado, por favor, actívelo y espere unos segundos. Gracias.'
			});
	}, 1500);
}

compruebaGPS();
  //$scope.recargarDatos();

/*
// Pruebas geopoints
var point = new Parse.GeoPoint(32.0, -20.0);
console.log("Geopunto: "); console.log(point);
console.log("Geopunto to JSON: "); console.log(point.toJSON());

var LocationObject = Parse.Object.extend("LocationObject");
var location = new LocationObject();
//location.set("location", point);
//location.set("location", point.toJSON());
//location.save(null, {});

window.ParsePushPlugin.setLocation(point.toJSON(), function(msg){
                console.log('Ubicación establecida');
            }, function(e) {
                console.log('Error en setLocation: ' + e);
            });
*/
})

.controller('controladorBarra', function ($scope, $ionicHistory) {
  	$scope.atras = function() {
    	$ionicHistory.goBack();
  	};
})


.controller('controladorDetalles', function($scope, oferta, $ionicModal, $compile, $ionicLoading) {
  $scope.oferta = oferta;

  $scope.nombreEs = decodeURIComponent(oferta.nombre);

  $scope.$on('$ionicView.beforeEnter', function() {
    	$scope.textoCanjear = "Canjear";
    	$scope.textoComoLlegar = "Como Llegar";
    	document.getElementById("botonBorrarOferta").style.display='none';
  	});

  $scope.mapControl = {};

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


.controller('controladorOfertasPublicadas', function($scope, datos, $localstorage, $ionicHistory, $ionicLoading, $ionicPopup) {
	$scope.borrar = function(oferta) {
		var confirmPopup = $ionicPopup.confirm({
		    title: 'Borrar oferta',
		    template: '¿Estás seguro de que quieres borrar la oferta?'
		});
		confirmPopup.then(function(res) {
		    if(res) {
		    	datos.borrarOferta(oferta);
		    	$ionicHistory.goBack();
		    } else {
		    	console.log('No borrando');
		    }
		});
		
	}

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
.controller('controladorDetallesPublicada', function($scope, oferta, $state, datos, $ionicPopup, $ionicHistory) {
	$scope.oferta = oferta;

	$scope.borrarOferta = function(oferta) {
		var confirmPopup = $ionicPopup.confirm({
		    title: 'Borrar oferta',
		    template: '¿Estás seguro de que quieres borrar la oferta?'
		});
		confirmPopup.then(function(res) {
		    if(res) {
		    	// Retroceder dos vistas
				// get the right history stack based on the current view
			    var historyId = $ionicHistory.currentHistoryId();
			    var history = $ionicHistory.viewHistory().histories[historyId];
			    // set the view 'depth' back in the stack as the back view
			    var targetViewIndex = history.stack.length - 1 - 2;
			    $ionicHistory.backView(history.stack[targetViewIndex]);
			    // navigate to it
			    $ionicHistory.goBack();
			   	datos.borrarOferta(oferta);
		    } else {
		    	console.log('No borrando');
		    }
		});
	}

	$scope.abreMapa = function() {
		$state.go('publicarOferta', {oferta: JSON.stringify($scope.oferta)});
	}

	$scope.$on('$ionicView.beforeEnter', function() {
    	document.getElementById("imagenCanjearOferta").className = "icon ion-camera";
    	document.getElementById("imagenComoLlegarOferta").className = "icon ion-document-text";
    	$scope.textoCanjear = "Escanear";
    	$scope.textoComoLlegar = "Editar";
    	$scope.textoBorrar = "Borrar";
  	})
})

;