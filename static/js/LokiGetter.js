app.factory('LokiGetter', ['$http','$window',"$q",function ($http,$window,$q) {
    return {
        postEmergenciesSubscription: function (userId, accessToken, parameters, successFunction, 
            errorFunction) {
            console.log("postEmergenciesSubscription");
            var message = {
                'dataverseName': "channels",
                'userId': userId,
                'accessToken': accessToken,
                'channelName': 'recentEmergenciesOfTypeChannel',
                'parameters': [parameters]
            };
            $http({
                url: '/subscribe',
                method: "POST",
                data: message
            }).then(successFunction, errorFunction);
        }
    };
}]);