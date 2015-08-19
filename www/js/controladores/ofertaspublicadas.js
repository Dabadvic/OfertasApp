/**
 * @file Controlador de los templates relacionados con las ofertas ya publicadas
 * @author David Abad Vich <davidabad10@gmail.com>
 * @version 6.1
*/

angular.module('controladores.ofertasPublicadas', ['servicio.datos', 'servicio.mapas', 'ionic', 'ngCordova'])


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
                  id: results[i].id,
                  veces_usada: results[i].get("veces_usada")
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
          	
          	if((ofertas[i].duracion != undefined && Date.parse(ofertas[i].duracion) < Date.parse(hoy)) 
          		|| (ofertas[i].usos != undefined && ofertas[i].usos == 0)) {
          		ofertas[i].caducada = true;
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
.controller('controladorDetallesPublicada', function($scope, oferta, $state, datos, $ionicPopup, $ionicHistory, $cordovaBarcodeScanner, $ionicLoading) {
	$scope.oferta = oferta;

	// Escanear Oferta
	$scope.canjearOferta = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
        	$ionicLoading.show({
			    template: 'analizando código'
			});
            console.log(imageData.text);
            //console.log("Barcode Format -> " + imageData.format);
            //console.log("Cancelled -> " + imageData.cancelled);

            var CodigoObject = Parse.Object.extend("CodigoOferta");
            var query = new Parse.Query(CodigoObject);

            query.get(imageData.text, {
            	success: function(codigo) {
            		if(codigo.get("id_oferta") == oferta.id && codigo.get("usado") == 'false') {
            			console.log("Escaneado con éxito");
            			
            			var pushQuery = new Parse.Query(Parse.Installation);
            			pushQuery.equalTo("installationId", codigo.get("installationId"));
            			// Notificar al dispositivo
	                    Parse.Push.send({
	                      where: pushQuery,
	                      data: {
	                        silent: true,
	                        valid: true
	                      }
	                    }, {
	                      success: function () {
	                        console.log("Respuesta enviada");
	                      },
	                      error: function (error) {
	                        console.log(error);
	                      }
	                    });

	                    $ionicPopup.alert({
						    title: 'Código válido',
						    template: 'El código escaneado es completamente válido'
					   	});

					   	codigo.set("usado", true);
					   	codigo.save(null, {});

					   	// Guarda datos para estadísticas y fines de ofertas
					   	var OfertaObject = Parse.Object.extend("OfertaObject");
					   	var ofertaQuery = new Parse.Query(OfertaObject);
					   	ofertaQuery.get(oferta.id, {
					   		success: function(result) {
					   			console.log("Toca actualizar oferta");
					   			// Si la oferta va por usos, disminuye en uno
					   			if (result.get("usos") != undefined) {
					   				var restantes = parseInt(result.get("usos"));
					   				restantes--;
					   				result.set("usos", restantes.toString());
					   				if (restantes == 0) {
					   					// Fin oferta
					   				}
					   			}

					   			// Aumenta en uno las veces que se ha usado la oferta
					   			var nuevo_uso = result.get("veces_usada") + 1;
					   			result.set("veces_usada", nuevo_uso);
					   			result.save(null, {
					   				error: function(error) {
					   					console.log(error);
					   				}
					   			});
					   		}
					   	});
            		} else {
            			var pushQuery = new Parse.Query(Parse.Installation);
            			pushQuery.equalTo("installationId", codigo.get("installationId"));
            			// Notificar al dispositivo
	                    Parse.Push.send({
	                      where: pushQuery,
	                      data: {
	                        silent: true,
	                        valid: false
	                      }
	                    }, {
	                      success: function () {
	                        console.log("Respuesta enviada");
	                      },
	                      error: function (error) {
	                        console.log(error);
	                      }
	                    });

	                    if (codigo.get("usado") == 'true') {
	                    	$ionicPopup.alert({
							    title: 'Código no válido',
							    template: 'El código ya ha sido usado'
						   	});
	                    } else {
	                    	$ionicPopup.alert({
							    title: 'Código no válido',
							    template: 'El código no pertenece a la oferta'
						   	});
	                    }
	                    
            		}
            	},
            	error: function(error) {
            		$ionicPopup.alert({
						    title: 'Código no válido',
						    template: 'El código ya ha sido escaneado'
					   	});
            	}
            });
        	$ionicLoading.hide();
        }, function(error) {
            console.log("An error happened -> " + error);
        });
    };

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

	// Editar Oferta
	$scope.abreMapa = function() {
		$state.go('publicarOferta', {oferta: JSON.stringify($scope.oferta)});
	}

	$scope.activaEstadisticas = function() {
		document.getElementById("divEstadisticasOferta").style.display='inherit';
	}

	$scope.$on('$ionicView.beforeEnter', function() {
		document.getElementById("imagenCanjearOferta").className = "icon ion-camera";
	    document.getElementById("imagenComoLlegarOferta").className = "icon ion-document-text";
	    document.getElementById("divCodigoQR").style.display='none';
	    document.getElementById("nombreLocal").style.display='none';
	    document.getElementById("botonEstadisticasOferta").style.display='none';
	    document.getElementById("divEstadisticasOferta").style.display='none';
	    document.getElementById("divOtrasOfertas").style.display='none';
	    document.getElementById("textoDistancia").style.display='none';
	    $scope.textoCanjear = "Escanear";
	    $scope.textoComoLlegar = "Editar";
	    $scope.textoBorrar = "Borrar";
	    $scope.textoEstadisticas = "Estadisticas";

		if (oferta.caducada == true) {
			document.getElementById("botonCanjearOferta").style.display='none';
	    	document.getElementById("botonComoLlegarOferta").style.display='none';
	    	document.getElementById("botonEstadisticasOferta").style.display='inherit';
		}

		if (oferta.usos != undefined)
			$scope.oferta.fin_usos = "" + oferta.usos;
		else
			$scope.oferta.fin_usos = "Sin cupones restantes";

		var duracion = new Date(oferta.duracion);
		if (oferta.duracion != undefined) {
			var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
	          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
	        ];

			$scope.oferta.fin_tiempo = "";
	        $scope.oferta.fin_tiempo += "Hasta " + duracion.getHours() + ":" + ((duracion.getMinutes().toString().length == 1) ? "0" + duracion.getMinutes() : duracion.getMinutes());
	        $scope.oferta.fin_tiempo += "h del " + duracion.getDate() + " de " + meses[duracion.getMonth()];
        	//$scope.oferta.fin_tiempo = "Fecha fin: " + duracion.getHours() + ":" + ((duracion.getMinutes().toString().length == 1) ? "0" + duracion.getMinutes() : duracion.getMinutes()) + " " + duracion.getDate() + "/" + (duracion.getMonth() + 1);
		} else {
        	$scope.oferta.fin_tiempo = "Hasta fin de existencias";
		}
  	})
})

;