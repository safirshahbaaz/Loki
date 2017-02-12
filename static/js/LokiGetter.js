app.factory('LokiGetter', ['$http','$window',"$q",function ($http,$window,$q) {
    return {
        postEmergency: function (marker, emergency, successFunction, errorFunction) {
            console.log("postEmergency");

            var message = {
                'marker': marker,
                'emergency': emergency
            };

            $http({
                url: '/create',
                method: "POST",
                data: message
            }).then(successFunction, errorFunction);
        }
    };
}]);