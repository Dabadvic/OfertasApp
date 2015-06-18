angular.module('controladoresApp', ['serviciosApp'])

.controller('controladorOfertas', function($scope, servicioOfertas, $state) {
  $scope.ofertas = servicioOfertas.ofertas;

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

.controller('controladorPreferencias', function($scope, $ionicModal, $timeout, $ionicLoading, $state) {
  $scope.notificaciones = function() {
    console.log('Cambio preferencias recibir notificaciones', $scope.recibirNotificaciones.checked);
  };

  $scope.recibirNotificaciones = {checked: true};

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

  // Abre el login
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.registraUsuario = function() {
  	$state.go('registro');

  	// Comprobará que la clave introducida sea correcta
  	$timeout(function() {
		$scope.closeLogin();
	}, 	1000);
  };


	// Identifica al usuario según nombre y contraseña
  	$scope.identificar = function() {
  		console.log('Identificando', $scope.loginData);

  		usuario = $scope.loginData.username;
		password = $scope.loginData.password;

   		var UserObject = Parse.Object.extend("UserObject");
   		var query = new Parse.Query(UserObject);
   		var correcto = false;
   		query.equalTo("usuario", usuario);

   		query.first({
   	    	success: function(object) {
   	        	if (object != undefined) {
	   	        	if (password == object.get("password")) {
	   	        		console.log("Clave correcta");
	   	        		correcto = true
	   	        		$ionicLoading.show({ template: 'Identificado con éxito', noBackdrop: true, duration: 2000 });
	   	        	} else {
	   	        		console.log("Clave incorrecta");
	   	        		$ionicLoading.show({ template: 'Clave incorrecta', noBackdrop: true, duration: 2000 });
	   	        	}
	   	        } else {
	   	        	$ionicLoading.show({ template: 'Usuario incorrecto', noBackdrop: true, duration: 2000 });
	   	        }
				
				if(correcto) {
	    			$scope.loginData.identificado = "Bienvenido, " + usuario;
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
  //------------------------------------------------------------------


})

.controller('controladorRegistro', function($scope, $ionicLoading, $ionicHistory) {

	// Crea los datos para el login modal
  	$scope.loginData = {};
	
	// Función que registra a un usuario
	$scope.registra = function() {
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

		        	//user.save(null, {});

					$ionicLoading.show({ template: 'Usuario registrado', noBackdrop: true, duration: 2000 });

					$ionicHistory.goBack();
    			}
   			},
   	    	error: function(error) {
   	        	// Error
	    	}
    	});
    };

.controller('controladorDetalles', function($scope, oferta) {
  $scope.oferta = oferta
});
