/**
 * @file Controlador de los templates relacionados directamente con el uso de ofertas
 * @author David Abad Vich <davidabad10@gmail.com>
 * @version 6.1
*/

angular.module('controladores.ofertas', ['servicio.datos', 'servicio.mapas', 'ionic', 'ngCordova'])

/**
   * @ngdoc controller
   * @namespace controladorOfertas
   * @requires $scope, $state, $localstorage, $ionicLoading, $cordovaPush, $rootScope, $timeout, $ionicPopup
   * @property {Hash} controls collection of Controls initiated within `map` directive
   * @property {Hash} markers collection of Markers initiated within `map` directive
   */
.controller('controladorOfertas', function($scope, $state, $localstorage, $ionicLoading, $cordovaPush, $rootScope, $timeout, $ionicPopup, oferta, datos) {
  
	function ofertasVacio() {
		if ($localstorage.get("hay_ofertas", "no") == "si") {
			document.getElementById("mensajeOfertas").style.display='none';
		} else {
		  	document.getElementById("mensajeOfertas").style.display='inherit';
		}
	}

  	/**
     * Se carga antes que la vista asignada a este controlador para comprobar si se ha recibido una oferta.
     * @memberof controladorOfertas
     * @function cargaPrevia
     */
	var cargaPrevia = function() {
    	if (oferta != undefined) {
		  	console.log("Cambiando a oferta");
		  	$state.go('detalle', {oferta: JSON.stringify(oferta)});
		  	oferta = undefined;
		}

		console.log("No hay oferta");
		$scope.nombre = $localstorage.get("user", "");
		
		ofertasVacio();

	/*
		if ($localstorage.get("notificaciones", true) == "true")
			window.parse.subscribeToChannel('news');
		else
			window.parse.unsubscribe('news');
	*/
  	};

  $scope.$on('$ionicView.beforeEnter', cargaPrevia);

  $scope.ofertas = datos.getOfertas();

  $scope.decode = function(str){
  	return decodeURIComponent(str);
  }

  $scope.preferencias = function() {
	$state.go('preferencias');
  }

  $scope.recargarDatos = function() {
  	//compruebaGPS();
  	console.log("Va a recargar los datos");
  	datos.cargarDatos();
  	$scope.ofertas = datos.getOfertas();
  	$timeout(ofertasVacio, 2000);
  }

/**
* Comprueba la disponibilidad del GPS, realizando una llamada al mismo y observando el resultado
* @memberof controladorOfertas
* @function compruebaGPS
*/
function compruebaGPS() {
 // Avisar al usuario de que tiene el GPS desactivado
  	var gpsStatus = "NO";
	navigator.geolocation.getCurrentPosition(function(pos){
		console.log(pos);
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
	    if(gpsStatus == "OK") {
	    	console.log("Estado del GPS: " + gpsStatus);
	    	$scope.recargarDatos();
	    } else {
	    	var alertPopup = $ionicPopup.alert({
				title: 'GPS inactivo',
				template: 'Es posible que el GPS esté desactivado o haya sido recientemente activado, por favor, actívelo y espere unos segundos. Gracias.'
			});
	    }
	}, 1500);
}

	compruebaGPS();
  //$scope.recargarDatos();
})

.controller('controladorBarra', function ($scope, $ionicHistory) {
  	$scope.atras = function() {
    	$ionicHistory.goBack();
  	};
})


/**
   * @ngdoc controller
   * @name controladorDetalles
   * @requires $scope, $ionicModal, $compile, $ionicLoading
   */
.controller('controladorDetalles', function($scope, $ionicModal, $compile, $ionicLoading, $cordovaBarcodeScanner, $ionicPopup, $ionicHistory, oferta) {
  $scope.oferta = oferta;

  $scope.nombreEs = decodeURIComponent(oferta.nombre);

  $scope.$on('$ionicView.beforeEnter', function() {
    	$scope.textoCanjear = "Canjear";
    	$scope.textoComoLlegar = "Como Llegar";
    	document.getElementById("botonBorrarOferta").style.display='none';
    	document.getElementById("divCodigoQR").style.display='none';
    	document.getElementById("botonEstadisticasOferta").style.display='none';
    	document.getElementById("divEstadisticasOferta").style.display='none';
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

  var codigoqr = undefined;
  $scope.canjearOferta = function() {
  	if (codigoqr == undefined) {
  		$ionicLoading.show({
	        template: 'preparando oferta'
	    });

	    window.ParsePushPlugin.on('receivePN', function(pn){
            console.log('Recibida notificacion');
            console.log(pn);
            if(pn.silent) {
                if(pn.valid) {
                	$ionicPopup.alert({
					    title: 'Código validado',
					    template: 'El código escaneado es correcto'
					}).then(function(res) {
				    	console.log('Fin de alerta');
				    	$ionicHistory.goBack();
				   	});
                } else {
                	$ionicPopup.alert({
					    title: 'Código incorrecto',
					    template: '¡El código no pertenece a la oferta!'
					});
                }
            }
        });

		window.ParsePushPlugin.getInstallationId(function(id) {
            console.log("Obtenida id de la instalacion: " + id);
            var CodigoObject = Parse.Object.extend("CodigoOferta");
            var codigo = new CodigoObject();
            codigo.set("id_oferta", oferta.id);
            codigo.set("installationId", id);
            codigo.save(null, {
            	success: function(code) {
            		console.log("Código creado con éxito, empezando QR");
            		document.getElementById("divCodigoQR").style.display='inherit';
				  	codigoqr = new QRCode(document.getElementById("qrcode"), {
					    text: code.id,
					    width: 200,
					    height: 200,
					    colorDark : "#000000",
					    colorLight : "#ffffff",
					    correctLevel : QRCode.CorrectLevel.H
					});
					$ionicLoading.hide();
            	}
            });
        }, function(e) {
            alert('error');
        });
	}
  }

})

/**
   * @ngdoc controller
   * @name controladorPublicar
   * @requires $scope, $localstorage, $ionicHistory, $ionicLoading
   */
.controller('controladorPublicar', function($scope, $localstorage, $ionicHistory, $ionicLoading, datos, oferta) {
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

;