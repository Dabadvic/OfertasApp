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
.controller('controladorOfertas', function($scope, $state, $localstorage, $ionicLoading, $cordovaPush, $translate, 
											$rootScope, $timeout, $ionicPopup, $translate, oferta, datos) {
  
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
		  	$state.go('detalle', {oferta: JSON.stringify(oferta)});
		  	oferta = undefined;
		}

		$scope.ofertas = datos.getOfertas();

		$scope.nombre = $localstorage.get("user", "");
		
		ofertasVacio();

		$translate.use($localstorage.get("idiomaApp", 'es'));
  	};

  $scope.$on('$ionicView.beforeEnter', cargaPrevia);

  $scope.ofertas = datos.getOfertas();

  if (oferta == undefined)
   $timeout(compruebaGPS, 1000);

  $scope.decode = function(str){
  	return decodeURIComponent(str);
  }

  $scope.preferencias = function() {
	$state.go('preferencias');
  }

  $scope.refresca = function () {
  	compruebaGPS().then(
  		function (msg) {
  			// Stop the ion-refresher from spinning
    		$scope.$broadcast('scroll.refreshComplete');
  		});
  }

  $scope.recargarDatos = function(lat, lon) {  	
  	datos.cargarDatos(lat, lon).then(
  		function (msg){
  			console.log("Recibe promesa: " + msg);
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
 	$translate(['Cargando']).then(function (translations) {
	    $ionicLoading.show({
		    template: translations.Cargando
		});
	  });

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
		    		console.log('setLocation: Ubicación establecida');
		    	}, function(e) {
		    		console.log('Error en setLocation: ' + e);
		    	});

		    	// Actualizar la posición en la base de datos
		    	window.ParsePushPlugin.getInstallationId(function(id) {
		    		var UbicacionesFavoritas = Parse.Object.extend("UbicacionesFavoritas");
		    		var query = new Parse.Query(UbicacionesFavoritas);
		    		query.equalTo("nombre", "last");
		    		query.equalTo("installationId", id);

		    		query.find().then(
		    			function (results) {
		    				var point = new Parse.GeoPoint(pos.coords.latitude, pos.coords.longitude);
		    				if(results.length > 0) {
	      							// La ubicacion ya existe y la actualizamos
	      							console.log("Actualizando ubicacion en BBDD");
	      							results[0].set("localizacion", point);
	      							results[0].save(null, {});
	      						} else {
	      							console.log("Creando ubicacion en BBDD");
	      							var ultimaPosicionConocida = new UbicacionesFavoritas();
	      							ultimaPosicionConocida.set("localizacion", point);
	      							ultimaPosicionConocida.set("nombre", "last");
	      							ultimaPosicionConocida.set("installationId", id);
	      							ultimaPosicionConocida.save(null, {});
	      						}
	      					});
		    	}, function(e) {
		    		console.log('compruebaGPS: Error en obtener id');
		    	});
		    }

		    promesa.resolve("GPS OK", pos.coords.latitude, pos.coords.longitude);
		}, function (error) {
	        console.log(error);

	        if (error.code == 3) {
	        	// error por timeout - usar última posición conocida
	        	var ultimaPos = $localstorage.getObject("ultimaPosicionConocida");
	        	if (ultimaPos.longitud != undefined) {
	        		gpsStatus = "OK";

	        		$translate(['NoGPS', 'UltimaPosicion']).then(function (translations) {
						$ionicPopup.alert({
							title: translations.NoGPS,
							template: translations.UltimaPosicion
						});
					});

	        		promesa.resolve("Usando localstorage ultima posicion", ultimaPos.latitud, ultimaPos.longitud);
	        	} else {
	        		// solo android 
	        		if (window.ParsePushPlugin) {
	        			window.ParsePushPlugin.getInstallationId(function(id) {
	        				var UbicacionesFavoritas = Parse.Object.extend("UbicacionesFavoritas");
	        				var query = new Parse.Query(UbicacionesFavoritas);
	        				query.equalTo("nombre", "last");
	        				query.equalTo("installationId", id);
	        				query.find().then(
	        					function (results) {
	        						if (results.length > 0) {
	        							ultimaPos = results[0].get("localizacion");
	        							gpsStatus = "OK";

	        							$translate(['NoGPS', 'UltimaPosicion']).then(function (translations) {
											$ionicPopup.alert({
												title: translations.NoGPS,
												template: translations.UltimaPosicion
											});
										});

	        							promesa.resolve("Usando ultima posicion BBDD", ultimaPos.latitude, ultimaPos.longitude);
	        						} else {
	        							promesa.reject("No existe la ubicacion en la BBDD");
	        							$ionicLoading.hide();
	        						}
	        					},
	        					function (error) {
	        						console.log("Error: " + error.code + " " + error.message);
	        						console.log("No leo ubicacion");
	        						promesa.reject(error);
	        						$ionicLoading.hide();
	        					});
	        			}, function(e) {
	        				console.log('compruebaGPS: Error en obtener id');
	        			});
					}
	        	}

	        } else {
	        	promesa.reject(error);
	        	$ionicLoading.hide();
	        }

	      },
	      {
	      	enableHighAccuracy: false,
			timeout: 5000,
			maximumAge: 0
	      });

		return promesa;
	}

	var promesa = new Parse.Promise();
	gpsLocation().then(
		function(msg, lat, lon) {
			console.log("Mensaje del gps: " + msg + ", " + lat + " " + lon + " Estado: " + gpsStatus);
			if(gpsStatus == "OK") {
		    	$scope.recargarDatos(lat, lon);
		    	promesa.resolve("Todo bien");
		    } else {

		    	$translate(['GPSInactivo', 'ReactivaGPS']).then(function (translations) {
					$ionicPopup.alert({
						title: translations.GPSInactivo,
						template: translations.ReactivaGPS
					});
				});

				promesa.reject("Algo fue mal");
				$ionicLoading.hide();
		    }
		});
	return promesa;
}

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
.controller('controladorDetalles', function($scope, $ionicModal, $compile, $ionicLoading, $cordovaBarcodeScanner, $ionicPopup, 
											$ionicHistory, $timeout, $translate, oferta, datos) {
  $scope.oferta = oferta;

  $scope.nombreEs = decodeURIComponent(oferta.nombre);

  $scope.$on('$ionicView.beforeEnter', function() {
    	$scope.textoCanjear = "Canjear";
    	$scope.textoComoLlegar = "Como Llegar";
    	
    	document.getElementById("botonBorrarOferta").style.display='none';
    	document.getElementById("divCodigoQR").style.display='none';
    	document.getElementById("botonEstadisticasOferta").style.display='none';
    	document.getElementById("divEstadisticasOferta").style.display='none';


    	// Pre-cargar las ofertas del mismo local
    	var listadoOfertas = datos.getOfertas();
    	$scope.ofertas = [];

    	for (var i = 0; i < listadoOfertas.length; i++) {
    		if (listadoOfertas[i].nombre == oferta.nombre && listadoOfertas[i].descripcion_corta != oferta.descripcion_corta) {
    			$scope.ofertas.push(listadoOfertas[i]);
    		}
    	}

    	if ($scope.ofertas.length == 0) {
    		document.getElementById("divOtrasOfertas").style.display='none';
    	}

    	if (oferta.fin_usos < 10) {
    		document.getElementById("textoFinUsos").classList.add('textoRojo');
    	} else {
    		document.getElementById("textoFinUsos").classList.add('textoVerde');
    	}

  	});

  $scope.cambiaOferta = function (oferta_nueva) {
  	$translate(['Cambiando']).then(function (translations) {
	    $ionicLoading.show({
		    template: translations.Cambiando
		});
	  });

    $timeout(function(){
    	// Cambia las otras ofertas
	  	for (var i = 0; i < $scope.ofertas.length; i++) {
	  		if ($scope.ofertas[i].descripcion_corta == oferta_nueva.descripcion_corta) {
	  			$scope.ofertas[i] = $scope.oferta;
	  		}
	  	}

	  	// Cambia la oferta base
	  	$scope.oferta = oferta_nueva;

	  	// Cambia el color
	  	if (oferta_nueva.fin_usos < 10) {
    		document.getElementById("textoFinUsos").classList.add('textoRojo');
    	} else {
    		document.getElementById("textoFinUsos").classList.add('textoVerde');
    	}

    	$ionicLoading.hide();
    }, 1000);
  }

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

    $scope.$on('$ionicView.leave', function() {
		$scope.modal.hide();
	});
  }

  $scope.cierraMapa = function() {
    $scope.modal.hide();
  }

  var codigoqr = undefined;
  
  $scope.canjearOferta = function() {
  	if (codigoqr == undefined && window.ParsePushPlugin) {
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

	    // Crear un nuevo código QR
		window.ParsePushPlugin.getInstallationId(function(id) {
			console.log("InstallationId: " + id + " Id oferta: " + oferta.id);

			var CodigoOferta = Parse.Object.extend("CodigoOferta");
      		var query = new Parse.Query(CodigoOferta);
			query.equalTo("installationId", id);
			query.equalTo("id_oferta", oferta.id);

			var promesa = new Parse.Promise();
			query.find().then(
				function (results) {
					if (results.length > 0) {
						console.log("Se ha encontrado un código registrado ya con los parametros");

						id_codigo = results[0].id;
						console.log("Devuelve código: " + id_codigo);
						promesa.resolve(id_codigo);
					} else {
						console.log("Ningún código coincide con esos parámetros");

						var nuevo_codigo = new CodigoOferta();
			            nuevo_codigo.set("id_oferta", oferta.id);
			            nuevo_codigo.set("installationId", id);
			            nuevo_codigo.set("usado", false);
			            nuevo_codigo.save().then(
			            	function (obj) {
			            		console.log("Devuelve código: " + obj.id);
			            		promesa.resolve(obj.id);
			            	});
					}
					return promesa;
				},
				function (error) {
					console.log("Crear código: Error al acceder a la BBDD de Parse");
					promesa.reject("error");
					return promesa;
				}).then(
				function (codigo) {
					console.log("Se ha obtenido codigo: " + codigo);
					if (codigo != "error") {
						console.log("Tenemos el código, creamos QR");
						document.getElementById("divCodigoQR").style.display='inherit';
					  	codigoqr = new QRCode(document.getElementById("qrcode"), {
						    text: codigo,
						    width: 200,
						    height: 200,
						    colorDark : "#000000",
						    colorLight : "#ffffff",
						    correctLevel : QRCode.CorrectLevel.H
						});
					}
					$ionicLoading.hide();
				});

        }, function(e) {
            alert('error');
        });

	} else if (codigoqr == undefined) {
		/*
		// QR de prueba
		document.getElementById("divCodigoQR").style.display='inherit';
					  	codigoqr = new QRCode(document.getElementById("qrcode"), {
						    text: "holamundo",
						    width: 200,
						    height: 200,
						    colorDark : "#000000",
						    colorLight : "#ffffff",
						    correctLevel : QRCode.CorrectLevel.H
						});
		*/
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
		$scope.oferta.duracion = oferta.duracion == undefined ? undefined : new Date(oferta.duracion);
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
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorDescripcionCorta").style.display = 'none';
				document.getElementById("inputDescripcionCorta").classList.remove('cajaError');
			}

			if ($scope.oferta.descripcion == undefined || $scope.oferta.descripcion.length < 1) {
				document.getElementById("textoDescripcionLarga").classList.add('textoError');//className='input-label textoError';
				document.getElementById("inputDescripcionLarga").classList.add('cajaError');
				document.getElementById("errorDescripcionLarga").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("textoDescripcionLarga").classList.remove('textoError');//className='input-label texto';
					
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorDescripcionLarga").style.display = 'none';
				document.getElementById("inputDescripcionLarga").classList.remove('cajaError');
			}

			if (($scope.oferta.duracion == undefined || $scope.oferta.duracion == null) && 
				($scope.oferta.usos == undefined || $scope.oferta.usos < 1 || $scope.oferta.usos == "")) {
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
					document.getElementById("textoUsos").classList.remove('textoError');//className='input-label texto';
				}, 2000);

				toRet = 0; 
			} else {
				document.getElementById("errorDuracion").style.display = 'none';
				document.getElementById("errorUsos").style.display = 'none';
				document.getElementById("inputDuracion").classList.remove('cajaError');
				document.getElementById("inputUsos").classList.remove('cajaError');
			}

			if ($scope.oferta.usos != undefined) {
				if (isNaN(parseInt($scope.oferta.usos))) {
					document.getElementById("textoUsos").classList.add('textoError');//className='input-label textoError';
					document.getElementById("inputUsos").classList.add('cajaError');
					$scope.errorUsos = "Usos debe ser un número";
					document.getElementById("errorUsos").style.display = 'inherit';

					$timeout(function() {
						document.getElementById("textoUsos").classList.remove('textoError');//className='input-label texto';
					}, 2000);

					toRet = 0;
				} else if ($scope.oferta.usos >= 10000) {
					document.getElementById("textoUsos").classList.add('textoError');//className='input-label textoError';
					document.getElementById("inputUsos").classList.add('cajaError');
					$scope.errorUsos = "Usos no puede ser mayor que 9999";
					document.getElementById("errorUsos").style.display = 'inherit';

					$timeout(function() {
						document.getElementById("textoUsos").classList.remove('textoError');//className='input-label texto';
					}, 2000);

					toRet = 0;
				} else {
					document.getElementById("errorUsos").style.display = 'none';
					document.getElementById("inputUsos").classList.remove('cajaError');
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