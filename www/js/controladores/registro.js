angular.module('controlador.Registro', ['servicio.datos','servicio.mapas'])

.controller('controladorRegistro', function($scope, $ionicLoading, $ionicHistory, geodatos, datos, $localstorage) {
	$scope.titulo = "Registro";

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

		var usuario = {};
		usuario.email = $scope.loginData.email;
		usuario.nombre = $scope.loginData.nombre;
		usuario.apellidos = $scope.loginData.apellidos;
		usuario.local = $scope.loginData.local;
		usuario.password = $scope.loginData.password;
		
		usuario.localizacion = {};
		usuario.localizacion.latitud = $scope.localizacion.latitud;
		usuario.localizacion.longitud = $scope.localizacion.longitud;

		if (datos.guardarUsuario(usuario)) {
			$localstorage.set("user", usuario.nombre);
			$localstorage.set("email", usuario.email);
			$localstorage.set("identificado", true);
		}

    };
})

.controller('controladorMapa', function($scope, $ionicLoading, $ionicHistory, geodatos) {
  	
  	// Código del plugin location picker
  	/* Búsqueda de posición inicial
  		Realiza una primera búsqueda de la ubicación del dispositivo:
  		- Si recibe ubicación, inicia el mapa en ese lugar. 
  		- Si no puede recibir ubicación, inicia el mapa en una posición predefinida.
  	*/
  	$scope.$on('$ionicView.beforeEnter', function () {
  		geodatos.creaMapa($('#mapa'), $('#latitud'), $('#longitud'));

       	console.log("Comprueba los geodatos");
		if (geodatos.getLocalizacion().longitud != undefined) {
			console.log("Cargando geodatos: " + geodatos.getLocalizacion().latitud + ", " + geodatos.getLocalizacion().longitud);
			
			geodatos.cambiaPosicion(geodatos.getLocalizacion().latitud, geodatos.getLocalizacion().longitud);

		} else {
			navigator.geolocation.getCurrentPosition(function (pos) {
				
				geodatos.cambiaPosicion(pos.coords.latitude, pos.coords.longitude);

		    }, function (error) {
		      alert('Unable to get location: ' + error.message);
		    });
		}
 	});

  	// Función para centrar el mapa en el usuario
  	$scope.centrar = function() {
  		console.log("Se va a centrar la posición");
  		navigator.geolocation.getCurrentPosition(function (pos) {
	      
	      document.getElementById("latitud").value = pos.coords.latitude;
  		  document.getElementById("longitud").value = pos.coords.longitude;
	      geodatos.cambiaPosicion(pos.coords.latitude, pos.coords.longitude);

	    }, function (error) {
	      alert('Unable to get location: ' + error.message);
	    });
  	}

  	/* Función que se activa al confirmar, guardando la localización
		- Es necesario usar las variables en html ya que son las que se cambian al arrastrar la posición en el mapa (ya que han sido asignadas),
		no he conseguido hacerlo de otra forma.
  	*/
  	$scope.confirmar = function() {
  		var lat = document.getElementById("latitud").value;
  		var lon = document.getElementById("longitud").value;
  		console.log("Guardando datos: " + lat + ", " + lon);
  		geodatos.setLocalizacion(lat,lon);
  		document.getElementById("elegir_hecho").style.visibility = "visible";
  		document.getElementById("boton_abre_mapa").className = "button button-block button-balanced";
  		$ionicHistory.goBack();
  	}

})
;