angular.module('controlador.Preferencias', ['servicio.datos'])

.controller('controladorPreferencias', function($scope, $ionicModal, $timeout, $state, $ionicLoading, $localstorage) {

  $scope.identifica = function() {
  	if($localstorage.get("identificado", false)) {
	    $scope.loginData.identificado = "Bienvenido, " + $localstorage.get("user", "") + ". Desconectarse";
	    document.getElementById("botonEditar").style.visibility = "visible";
      document.getElementById("botonPublicar").style.visibility = "visible";
      document.getElementById("botonOfertasPublicadas").style.visibility = "visible";
    } else {
	    $scope.loginData.identificado = "¿Eres dueño de un negocio? Identifícate";
	    document.getElementById("botonEditar").style.visibility = "hidden";
      document.getElementById("botonPublicar").style.visibility = "hidden";
      document.getElementById("botonOfertasPublicadas").style.visibility = "hidden";
    }
  }

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.recibirNotificaciones = {checked: ($localstorage.get("notificaciones", true))};

    if ($localstorage.get("notificaciones", true) == "false")
      $scope.recibirNotificaciones = {checked: false};
    else
      $scope.recibirNotificaciones = {checked: true};

    $scope.identifica();
  })

  $scope.notificaciones = function() {
    $localstorage.set("notificaciones", $scope.recibirNotificaciones.checked);
  };

  $scope.irEditarPerfil = function() {
  	$state.go('editarPerfil');
  }

  //----------------------------------------------------Login-------------------------------------------------------------------------

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
  	if(!$localstorage.get("identificado", false)) {
    	$scope.modal.show();
	    $scope.loginData.username = '';
		$scope.loginData.password = '';
		$scope.loginData.key = '';
	} else {
		$localstorage.clear();
		$scope.identifica();
	}

  };

  // Función que asigna al botón registrar la función de ir a la vista de registro ---------------------------------------Registro
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
	   	        		
	   	        		//Marcar la clave como usada
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

	   	        		// Guarda las preferencias:
	   	        		$localstorage.set("user", nombre);
                  $localstorage.set("id", object.id);
	   	        		$localstorage.set("email", object.get("email"));
	   	        		$localstorage.set("identificado", true);

	   	        		$ionicLoading.show(toast);
	   	        	} else {
	   	        		toast.template = 'Contraseña incorrecta';
	   	        		$ionicLoading.show(toast);
	   	        	}
	   	        } else {
	   	        	toast.template = 'Usuario incorrecto';
	   	        	$ionicLoading.show(toast);
	   	        }
				
	   	        $scope.identifica();

      			$scope.closeLogin();

   	    	},
   	    	error: function(error) {
   	        	console.log("Error: " + error.code + " " + error.message);
	       	}
    	});
	};
})
;