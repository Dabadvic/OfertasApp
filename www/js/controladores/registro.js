angular.module('controlador.Registro', ['servicio.datos','servicio.mapas'])

.controller('controladorRegistro', function($scope, $ionicLoading, $ionicHistory, $timeout, geodatos, datos, $localstorage) {
	$scope.titulo = "Registro";

	$scope.$on('$ionicView.beforeEnter', function () {
       	console.log("Comprueba los geodatos");
		if (geodatos.getLocalizacion().longitud != undefined) {
			console.log("Cargando geodatos: " + geodatos.getLocalizacion().latitud + ", " + geodatos.getLocalizacion().longitud);
			$scope.localizacion = {};
			$scope.localizacion.longitud = geodatos.getLocalizacion().longitud;
			$scope.localizacion.latitud = geodatos.getLocalizacion().latitud;
		} else {
			$scope.localizacion = {};
			$scope.localizacion.longitud = undefined;
			$scope.localizacion.latitud = undefined;
		}
 	});

	// Crea los datos para el login modal
  	$scope.loginData = {};
	
	// Función que registra a un usuario
	$scope.registra = function() {
		function validaCampos() {
			var toRet = 1;
			if ($scope.loginData.nombre == undefined || $scope.loginData.nombre.length < 1){
				document.getElementById("inputNombre").classList.add('cajaError');
				document.getElementById("errorNombre").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("inputNombre").classList.remove('cajaError');
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorNombre").style.display = 'none';
			}

			if ($scope.loginData.apellidos == undefined || $scope.loginData.apellidos.length < 1){
				document.getElementById("inputApellidos").classList.add('cajaError');
				document.getElementById("errorApellidos").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("inputApellidos").classList.remove('cajaError');
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorApellidos").style.display = 'none';
			}

			if ($scope.loginData.password == undefined || $scope.loginData.password.length < 1){
				document.getElementById("textPass").classList.add('cajaError');
				document.getElementById("errorPass").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("textPass").classList.remove('cajaError');
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorPass").style.display = 'none';
			}

			if ($scope.loginData.password != $scope.loginData.repassword) {
				document.getElementById("textoRePass").classList.add('cajaError');
				document.getElementById("errorRePass").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("textoRePass").classList.remove('cajaError');
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorRePass").style.display = 'none';
			}

			if ($scope.loginData.email == undefined || $scope.loginData.email.length < 1){
				document.getElementById("inputCorreo").classList.add('cajaError');
				document.getElementById("errorCorreo").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("inputCorreo").classList.remove('cajaError');
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorCorreo").style.display = 'none';
			}

			if ($scope.loginData.local == undefined || $scope.loginData.local.length < 1){
				document.getElementById("inputLocal").classList.add('cajaError');
				document.getElementById("errorLocal").style.display = 'inherit';
				$timeout(function() {
					document.getElementById("inputLocal").classList.remove('cajaError');
				}, 2000);

				toRet = 0;
			} else {
				document.getElementById("errorLocal").style.display = 'none';
			}

			if ($scope.localizacion.latitud == undefined || $scope.localizacion.longitud == undefined) {
				document.getElementById("errorLocalizacion").style.display = 'inherit';

				toRet = 0;
			} else {
				document.getElementById("errorLocalizacion").style.display = 'none';
			}

			return toRet;
		}

		if (validaCampos() == 0) {
			document.getElementById("errorGeneral").style.display = 'inherit';
			return 0;
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