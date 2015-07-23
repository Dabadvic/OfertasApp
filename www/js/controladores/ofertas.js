/**
 * @file Controlador de los templates relacionados directamente con el uso de ofertas
 * @author David Abad Vich <davidabad10@gmail.com>
 * @version 6.1
*/

angular.module('controladores.ofertas', ['servicio.datos', 'servicio.mapas', 'ionic', 'ngCordova'])

/**
   * @ngdoc controller
   * @namespace controladorOfertas
   * @requires $scope
   * @requires $state
   * @requires $localstorage
   * @requires $ionicLoading
   * @requires $cordovaPush
   * @requires $rootScope
   * @requires $timeout
   * @requires $ionicPopup
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

  $scope.recargarDatos = function(lat, lon) {
  	console.log("Va a recargar los datos");
  	
  	datos.cargarDatos(lat, lon).then(
  		function(msg){
  			console.log("Recive promesa: " + msg);
  			ofertasVacio();
  			$scope.ofertas = datos.getOfertas();
  			$ionicLoading.hide();
  		});
  }

  $scope.recarga = function() {
  	compruebaGPS();
  }

/**
* Comprueba la disponibilidad del GPS, realizando una llamada al mismo y observando el resultado
* @memberof controladorOfertas
* @function compruebaGPS
*/
function compruebaGPS() {
 // Avisar al usuario de que tiene el GPS desactivado
 	$ionicLoading.show({
	    template: 'loading'
	});
  	var gpsStatus = "NO";
  	function gpsLocation() {
  		var promesa = new Parse.Promise();
  	
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

		    promesa.resolve("GPS OK", pos.coords.latitude, pos.coords.longitude);
		}, function (error) {
	        console.log(error);
	        
	        promesa.reject(error);
	      });

		return promesa;
	}

	gpsLocation().then(
		function(msg, lat, lon) {
			console.log("Mensaje del gps: " + msg + ". " + lat + " " + lon);
			if(gpsStatus == "OK") {
		    	console.log("Estado del GPS: " + gpsStatus);
		    	$scope.recargarDatos(lat, lon);
		    } else {
		    	var alertPopup = $ionicPopup.alert({
					title: 'GPS inactivo',
					template: 'Es posible que el GPS esté desactivado o haya sido recientemente activado, por favor, actívelo y espere unos segundos. Gracias.'
				});
				$ionicLoading.hide();
		    }
		});
}

	compruebaGPS();
})

.controller('controladorBarra', function ($scope, $ionicHistory) {
  	$scope.atras = function() {
    	$ionicHistory.goBack();
  	};
})


/**
   * @ngdoc controller
   * @namespace controladorDetalles
   * @requires $scope
   * @requires $ionicModal
   * @requires $compile
   * @requires $ionicLoading
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
   * @namespace controladorPublicar
   * @requires $scope
   * @requires $localstorage
   * @requires $ionicHistory
   * @requires $
   */
.controller('controladorPublicar', function($scope, $localstorage, $ionicHistory, $timeout, datos, oferta) {
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
		function valida() {
			var toRet = 1;
			if ($scope.oferta.descripcion_corta == undefined || $scope.oferta.descripcion_corta.length < 1){
				document.getElementById("textoDescripcionCorta").classList.add('textoError');//className='input-label textoError';
				document.getElementById("inputDescripcionCorta").classList.add('cajaError');
				document.getElementById("errorDescripcionCorta").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("textoDescripcionCorta").classList.remove('textoError');//className='input-label texto';
					document.getElementById("inputDescripcionCorta").classList.remove('cajaError');
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorDescripcionCorta").style.display = 'none';
			}

			if ($scope.oferta.descripcion == undefined || $scope.oferta.descripcion.length < 1) {
				document.getElementById("textoDescripcionLarga").classList.add('textoError');//className='input-label textoError';
				document.getElementById("inputDescripcionLarga").classList.add('cajaError');
				document.getElementById("errorDescripcionLarga").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("textoDescripcionLarga").classList.remove('textoError');//className='input-label texto';
					document.getElementById("inputDescripcionLarga").classList.remove('cajaError');
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorDescripcionLarga").style.display = 'none';
			}

			if (($scope.oferta.duracion == undefined || $scope.oferta.duracion == null) && 
				($scope.oferta.usos == undefined || $scope.oferta.usos < 1)) {
				document.getElementById("textoDuracion").classList.add('textoError');//className='input-label textoError';
				document.getElementById("inputDuracion").classList.add('cajaError');
				
				$scope.errorDuracion = "Debe introducir duracion o usos";
				$scope.errorUsos = "Debe introducir duracion o usos";

				document.getElementById("errorDuracion").style.display = 'inherit';
				document.getElementById("errorUsos").style.display = 'inherit';

				document.getElementById("textoUsos").classList.add('textoError');//className='input-label textoError';
				document.getElementById("inputUsos").classList.add('cajaError');

				$timeout(function() {
					document.getElementById("textoDuracion").classList.remove('textoError');//className='input-label texto';
					document.getElementById("inputDuracion").classList.remove('cajaError');

					document.getElementById("textoUsos").classList.remove('textoError');//className='input-label texto';
					document.getElementById("inputUsos").classList.remove('cajaError');
				}, 2000);

				toRet = 0; 
			} else {
				document.getElementById("errorDuracion").style.display = 'none';
				document.getElementById("errorUsos").style.display = 'none';
			}

			if ($scope.oferta.usos != undefined) {
				if (isNaN(parseInt($scope.oferta.usos))) {
					document.getElementById("textoUsos").classList.add('textoError');//className='input-label textoError';
					document.getElementById("inputUsos").classList.add('cajaError');
					$scope.errorUsos = "Usos debe ser un número";
					document.getElementById("errorUsos").style.display = 'inherit';

					$timeout(function() {
						document.getElementById("textoUsos").classList.remove('textoError');//className='input-label texto';
						document.getElementById("inputUsos").classList.remove('cajaError');
					}, 2000);

					toRet = 0;
				} else if ($scope.oferta.usos >= 10000) {
					document.getElementById("textoUsos").classList.add('textoError');//className='input-label textoError';
					document.getElementById("inputUsos").classList.add('cajaError');
					$scope.errorUsos = "Usos no puede ser mayor que 9999";
					document.getElementById("errorUsos").style.display = 'inherit';

					$timeout(function() {
						document.getElementById("textoUsos").classList.remove('textoError');//className='input-label texto';
						document.getElementById("inputUsos").classList.remove('cajaError');
					}, 2000);

					toRet = 0;
				} else {
					document.getElementById("errorUsos").style.display = 'none';
				}
			}

			return toRet;
		}

		if (valida() == 0) {
			document.getElementById("errorGeneral").style.display = 'inherit';
		} else {
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

	}
})

;