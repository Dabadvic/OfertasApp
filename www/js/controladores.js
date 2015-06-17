angular.module('controladoresApp', ['serviciosApp'])

.controller('controladorOfertas', function($scope, servicioOfertas, $state) {
  $scope.ofertas = servicioOfertas.ofertas;

  $scope.preferencias = function() {
		console.log("Cambia vista a preferencias");
		$state.go('preferencias');
	}
})

.controller('controladorBarra', function MyCtrl($scope, $ionicHistory) {
  	$scope.atras = function() {
  		console.log("Vuelve atrás");
    	$ionicHistory.goBack();
  	};
})

.controller('controladorPreferencias', function($scope, $ionicModal, $timeout, $ionicLoading) {
  $scope.notificaciones = function() {
    console.log('Cambio preferencias recibir notificaciones', $scope.recibirNotificaciones.checked);
  };

  $scope.recibirNotificaciones = {checked: true};

  //----------------------------Login---------------------------------
  
  // Form data for the login modal
  $scope.loginData = {};
  $scope.loginData.identificado = "¿Eres dueño de un negocio? Identifícate";
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

	$scope.registraUsuario = function() {
		usuario = $scope.loginData.username;
		password = $scope.loginData.password;

		var UserObject = Parse.Object.extend("UserObject");
   		var query = new Parse.Query(UserObject);

   		query.equalTo("usuario", usuario);

   		query.find({
   	   		success: function(results) {
   	   			if (results.length > 0) {
   	    	   		// El usuario ya existe
    				console.log("Usuario existente");
    				alert("Usuario existente");
    			} else {
    				// Crea el usuario si no existe
   	        		console.log('Registrando usuario: ', usuario);
   	        		var user = new UserObject();
		        	user.set("usuario", usuario);
		        	user.set("password", password);
		        	user.save(null, {});
		        	$timeout(function() {
			      		$scope.closeLogin();
					}, 	1000);
    			}
   			},
   	    	error: function(error) {
   	        	// Error
	    	}
    	});
    };

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
   	    	},
   	    	error: function(error) {
   	        	console.log("Error: " + error.code + " " + error.message);
	       	}
    	});

    	$timeout(function() {
    		if(correcto) {
    			$scope.loginData.identificado = "Bienvenido, " + usuario;
    		} else {
    			$scope.loginData.identificado = "¿Eres dueño de un negocio? Identifícate";
    		}
    		console.log("Estado: " + correcto);
      		$scope.closeLogin();
    	}, 	1500);
	};
  //------------------------------------------------------------------


})

.controller('controladorDetalles', function($scope, oferta) {
  $scope.oferta = oferta
});
