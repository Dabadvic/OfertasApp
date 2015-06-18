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

//----------------------------------------Preferencias---------------------------------------------------------------

.controller('controladorPreferencias', function($scope, $ionicModal, $timeout, $ionicLoading, $state) {
  
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
	   	        		usada = true;

	   	        		object.set("usada", usada);
	   	        		object.save(null, {});
	   	        	} else {
	   	        		toast.template = 'La clave ya ha sido usada';
	   	        		$ionicLoading.show(toast);
	   	        	}
	   	        } else {
	   	        	toast.template = 'Clave incorrecta';
	   	        	$ionicLoading.show(toast);
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


	// Función que identifica al usuario según nombre y contraseña
  	$scope.identificar = function() {
  		console.log('Identificando', $scope.loginData);

  		var usuario = $scope.loginData.username;
		var password = $scope.loginData.password;

   		var UserObject = Parse.Object.extend("UserObject");
   		var query = new Parse.Query(UserObject);
   		var correcto = false;
   		query.equalTo("usuario", usuario);

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
})

//----------------------------------------Registro-------------------------------------------------------------------

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

.controller('controladorDetalles', function($scope, oferta) {
  $scope.oferta = oferta
});
