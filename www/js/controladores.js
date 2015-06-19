angular.module('controladoresApp', ['serviciosApp'])

.controller('controladorOfertas', function($scope, servicioOfertas, $state) {
  $scope.ofertas = servicioOfertas.ofertas;

  console.log("Carga main");

  $scope.preferencias = function() {
		console.log("Cambia vista a preferencias");
		$state.go('preferencias');
	}
})

.controller('controladorBarra', function ($scope, $ionicHistory) {
  	$scope.atras = function() {
  		console.log("Vuelve atrás");
    	$ionicHistory.goBack();
  	};
})

//----------------------------------------Preferencias---------------------------------------------------------------

.controller('controladorPreferencias', function($scope, $ionicModal, $timeout, $state, $ionicLoading) {
  // Prepara las preferencias de usuario sobre recibir notificaciones
  $scope.recibirNotificaciones = {checked: true};

  $scope.notificaciones = function() {
    console.log('Cambio preferencias recibir notificaciones', $scope.recibirNotificaciones.checked);
  };

  //----------------------------Login---------------------------------
  
  document.getElementById("botonEditar").style.visibility = "hidden";

  // Crea los datos para el login modal
  $scope.loginData = {};
  $scope.loginData.identificado = "¿Eres dueño de un negocio? Identifícate";
  
  // Crear la ventana modal que usaremos para el login
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Función para cerrar el login
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Abre el login, reiniciando los campos por si han sido utilizados antes
  $scope.login = function() {
    $scope.modal.show();
    $scope.loginData.username = '';
	$scope.loginData.password = '';
	$scope.loginData.key = '';
  };

  // Función que asigna al botón registrar la función de ir a la vista de registro
  $scope.registraUsuario = function() {
  	// Comprobará que la clave introducida sea correcta
  	var KeyObject = Parse.Object.extend("KeyObject");
  	var query = new Parse.Query(KeyObject);

  	var clave = $scope.loginData.key;

  	query.equalTo("key", clave);

  	query.first({
   	    	success: function(object) {
   	    		// Define el mensaje tipo toast que va a mostrar
   	    		var toast = {};
   	    		toast.noBackdrop = true;
   	    		toast.duration = 1500;

   	    		// Si no lo encuentra devuelve undefined, si lo encuentra se comprobaría la contraseña
   	        	if (object != undefined) {
	   	        	var usada = object.get("usada");
	   	        	if (!usada) {
	   	        		toast.template = 'Clave correcta';
	   	        		$ionicLoading.show(toast);
	   	        		$state.go('registro');
	   	        		$scope.closeLogin();
	   	        		/*
	   	        		usada = true;

	   	        		object.set("usada", usada);
	   	        		object.save(null, {});
	   	        		*/
	   	        	} else {
	   	        		toast.template = 'La clave ya ha sido usada';
	   	        		$ionicLoading.show(toast);
	   	        	}
	   	        } else {
	   	        	toast.template = 'Clave incorrecta';
	   	        	$ionicLoading.show(toast);
	   	        }
   	    	},
   	    	error: function(error) {
   	        	console.log("Error: " + error.code + " " + error.message);
	       	}
    	});
  };


	// Función que identifica al usuario según nombre y contraseña
  	$scope.identificar = function() {
  		console.log('Identificando', $scope.loginData);

  		var email = $scope.loginData.username;
		var password = $scope.loginData.password;
		var nombre;

   		var UserObject = Parse.Object.extend("UserObject");
   		var query = new Parse.Query(UserObject);
   		var correcto = false;
   		query.equalTo("email", email);

   		// Función de Parse que busca la primera ocurrencia de lo especificado anteriormente
   		// (como sólo habrá un usuario registrado con un mismo email, esto será suficiente)
   		query.first({
   	    	success: function(object) {
   	    		// Define el mensaje tipo toast que va a mostrar
   	    		var toast = {};
   	    		toast.noBackdrop = true;
   	    		toast.duration = 1500;

   	    		// Si no lo encuentra devuelve undefined, si lo encuentra se comprobaría la contraseña
   	        	if (object != undefined) {
	   	        	if (password == object.get("password")) {
	   	        		correcto = true;
	   	        		nombre = object.get("nombre");
	   	        		toast.template = 'Identificado con éxito';
	   	        		$ionicLoading.show(toast);
	   	        	} else {
	   	        		toast.template = 'Contraseña incorrecta';
	   	        		$ionicLoading.show(toast);
	   	        	}
	   	        } else {
	   	        	toast.template = 'Usuario incorrecto';
	   	        	$ionicLoading.show(toast);
	   	        }
				
				if(correcto) {
	    			$scope.loginData.identificado = "Bienvenido, " + nombre;
	    			document.getElementById("botonEditar").style.visibility = "visible";
	    		} else {
	    			$scope.loginData.identificado = "¿Eres dueño de un negocio? Identifícate";
	    			document.getElementById("botonEditar").style.visibility = "hidden";
	    		}

	    		console.log("Estado: " + correcto);
      			$scope.closeLogin();

   	    	},
   	    	error: function(error) {
   	        	console.log("Error: " + error.code + " " + error.message);
	       	}
    	});
	};
})

//----------------------------------------Registro-------------------------------------------------------------------

.controller('controladorRegistro', function($scope, $ionicLoading, $ionicHistory, geodatos) {
	
	$scope.$on('$ionicView.beforeEnter', function () {
       	console.log("Comprueba los geodatos");
		if (geodatos.getLocalizacion().longitud != undefined) {
			console.log("Cargando geodatos: " + geodatos.getLocalizacion().latitud + ", " + geodatos.getLocalizacion().longitud);
			$scope.localizacion = {};
			$scope.localizacion.longitud = geodatos.getLocalizacion().longitud;
			$scope.localizacion.latitud = geodatos.getLocalizacion().latitud;
		}
 	});

	// Crea los datos para el login modal
  	$scope.loginData = {};
	
	// Función que registra a un usuario
	$scope.registra = function() {
		if ($scope.loginData.password != $scope.loginData.repassword) {
			$ionicLoading.show({template: 'La contraseña no coincide', noBackdrop: true, duration: 1500});
			return undefined;
		}

		var email = $scope.loginData.email;
		var nombre = $scope.loginData.nombre;
		var apellidos = $scope.loginData.apellidos;
		var local = $scope.loginData.local;
		var password = $scope.loginData.password;

		var UserObject = Parse.Object.extend("UserObject");
   		var query = new Parse.Query(UserObject);

   		// Para comprobar la existencia del usuario, de momento sólo se permite una cuenta por email 
   		query.equalTo("email", email);

   		query.find({
   	   		success: function(results) {
   	   			if (results.length > 0) {
   	    	   		// El usuario ya existe
    				console.log("Usuario existente");
    				alert("Usuario existente");
    			} else {
    				// Crea el usuario si no existe

   	        		console.log('Registrando usuario: ', nombre);
   	        		var user = new UserObject();
		        	
		        	user.set("nombre", nombre);
		        	user.set("password", password);
		        	user.set("apellidos", apellidos);
		        	user.set("email", email);
		        	user.set("local", local);
		        	user.set("latitud", $scope.localizacion.latitud);
		        	user.set("longitud", $scope.localizacion.longitud);

		        	user.save(null, {});

					$ionicLoading.show({ template: 'Usuario registrado', noBackdrop: true, duration: 2000 });

					$ionicHistory.goBack();
    			}
   			},
   	    	error: function(error) {
   	        	// Error
	    	}
    	});
    };
})


.controller('controladorMapa', function($scope, $ionicLoading, $ionicHistory, geodatos) {
  	
  	// Código del plugin location picker
  	/* Búsqueda de posición inicial
  		Realiza una primera búsqueda de la ubicación del dispositivo:
  		- Si recibe ubicación, inicia el mapa en ese lugar. 
  		- Si no puede recibir ubicación, inicia el mapa en una posición predefinida.
  	*/
  	navigator.geolocation.getCurrentPosition(function (pos) {
	      $('#mapa').locationpicker({
				location: {latitude: pos.coords.latitude, longitude: pos.coords.longitude},	
				radius: 0,
				inputBinding: {
			        latitudeInput: $('#latitud'),
			        longitudeInput: $('#longitud'),
			    }
			});

	    }, function (error) {
	      alert('Unable to get location: ' + error.message);
	      $('#mapa').locationpicker({
				location: {latitude: 46.15242437752303, longitude: 2.7470703125},	
				radius: 0,
				inputBinding: {
			        latitudeInput: $('#latitud'),
			        longitudeInput: $('#longitud'),
			    }
			});
	    });

  	// Función para centrar el mapa en el usuario
  	$scope.centrar = function() {
  		console.log("Se va a centrar la posición");
  		navigator.geolocation.getCurrentPosition(function (pos) {
	      
	      document.getElementById("latitud").value = pos.coords.latitude;
  		  document.getElementById("longitud").value = pos.coords.longitude;
	      $('#mapa').locationpicker({
				location: {latitude: pos.coords.latitude, longitude: pos.coords.longitude},	
				radius: 0,
				inputBinding: {
			        latitudeInput: $('#latitud'),
			        longitudeInput: $('#longitud'),
			    }
			});

	    }, function (error) {
	      alert('Unable to get location: ' + error.message);
	    });
  	}

  	// Función que se activa al confirmar, guardando la localización
  	$scope.confirmar = function() {
  		var lat = document.getElementById("latitud").value;
  		var lon = document.getElementById("longitud").value;
  		console.log("Guardando datos: " + lat + ", " + lon);
  		geodatos.setLocalizacion(lat,lon);
  		document.getElementById("elegir_hecho").style.visibility = "visible";
  		document.getElementById("boton_abre_mapa").className = "button button-block button-balanced";
  		$ionicHistory.goBack();
  	}

  	// Código de google maps API
  	$scope.mapCreated = function(map) {
    	$scope.map = map;
  	};

  	$scope.centerOnMe = function () {
	    console.log("Centering");
	    if (!$scope.map) {
	      return;
	    }

	    $scope.loading = $ionicLoading.show({
	      content: 'Getting current location...',
	      showBackdrop: false
	    });

	    navigator.geolocation.getCurrentPosition(function (pos) {
	      console.log('Got pos', pos);
	      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
	      $scope.loading.hide();
	    }, function (error) {
	      alert('Unable to get location: ' + error.message);
	    });
  	};

})

.controller('controladorDetalles', function($scope, oferta) {
  $scope.oferta = oferta
});
