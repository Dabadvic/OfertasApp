angular.module('controlador.editar', ['servicio.datos', 'servicio.mapas'])

.controller('controladorEditarPerfil', function($scope, $localstorage, $ionicLoading, $ionicHistory, geodatos) {
	// Comprueba los geodatos
	$scope.$on('$ionicView.beforeEnter', function () {
		if (geodatos.getLocalizacion().longitud != undefined) {
			console.log("Cargando geodatos: " + geodatos.getLocalizacion().latitud + ", " + geodatos.getLocalizacion().longitud);
			$scope.localizacion = {};
			$scope.localizacion.longitud = geodatos.getLocalizacion().longitud;
			$scope.localizacion.latitud = geodatos.getLocalizacion().latitud;
		}
 	});

	document.getElementById("textPass").placeholder = "Contraseña (dejar para mantenerla)";
	document.getElementById("botonRegistro").innerHTML = "Guardar cambios";
	$scope.titulo = "Editar Perfil";
	$scope.loginData = {};
	var email = $localstorage.get("email", "");
	var UserObject = Parse.Object.extend("UserObject");
   	var query = new Parse.Query(UserObject);
   	query.equalTo("email", email);

   	$ionicLoading.show({
        template: 'loading'
    });

   	query.first({
   	    success: function(usuario) {
   	  		// Si no lo encuentra devuelve undefined
   	        if (usuario != undefined) {
	   	    	$scope.loginData.email = usuario.get("email");
				$scope.loginData.nombre = usuario.get("nombre");
				$scope.loginData.apellidos = usuario.get("apellidos");
				$scope.loginData.local = usuario.get("local");

				$scope.localizacion = {};
				$scope.localizacion.latitud = usuario.get("latitud");
		        $scope.localizacion.longitud = usuario.get("longitud");

		        geodatos.setLocalizacion($scope.localizacion.latitud, $scope.localizacion.longitud);
	   	    } else {
	   	        console.log("Error al editar datos, email no encontrado");
	   	    }
	   	    $ionicLoading.hide();
   	    },
   	    error: function(error) {
   	        console.log("Error: " + error.code + " " + error.message);
	    }
    });

   	$scope.registra = function() {
   		var email = $scope.loginData.email;
		var nombre = $scope.loginData.nombre;
		var apellidos = $scope.loginData.apellidos;
		var local = $scope.loginData.local;
		if ($scope.loginData.password) {
			console.log("Cambiamos el password");
			if ($scope.loginData.password != $scope.loginData.repassword) {
				$ionicLoading.show({template: 'La contraseña no coincide', noBackdrop: true, duration: 1500});
				return undefined;
			}
			var password = $scope.loginData.password;
		}

		$localstorage.set("user", nombre);
		$localstorage.set("email", email);

		query.first({
	   	    success: function(usuario) {
	   	  		// Si no lo encuentra devuelve undefined
	   	        if (usuario != undefined) {
		   	    	usuario.set("nombre", nombre);

		   	    	if (password)
		        		usuario.set("password", password);

		        	usuario.set("apellidos", apellidos);
		        	usuario.set("email", email);
		        	usuario.set("local", local);
		        	usuario.set("latitud", $scope.localizacion.latitud);
		        	usuario.set("longitud", $scope.localizacion.longitud);

		        	usuario.save(null, {});
		   	    } else {
		   	        console.log("Error al confirmar, email no encontrado");
		   	    }
	   	    },
	   	    error: function(error) {
	   	        console.log("Error: " + error.code + " " + error.message);
		    }
	    });
	    $ionicHistory.goBack();
   	}

})

;