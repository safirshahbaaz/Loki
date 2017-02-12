app.controller('LokiController', ['$scope', '$window','$filter', 'LokiGetter', 
    'EmergenciesGetter', function ($scope,$window, $filter, LokiGetter, EmergenciesGetter) {

        console.log("In LokiController");

        $scope.map = {center: {latitude: 40.1451, longitude: -99.6680 }, zoom: 7 };
        $scope.chords={latitude: 40.1451, longitude: -99.6680 };
        $scope.options = {scrollwheel: false};
        $scope.address='';
        $scope.control= {};
        $scope.addresses=[];
        $scope.markers=[];
        $scope.length=0;
        $scope.chkbxs = EmergenciesGetter;
        var bounds = new google.maps.LatLngBounds();
        var counter = 0;

        var searchAddressInput = document.getElementById('pac-input');
        var autocomplete = new google.maps.places.Autocomplete(searchAddressInput);

        var emergencySuccessFunction = function(data) {
            console.log("All is well with subscriptions!");

            counter++;
            console.log("counter:" + counter);

            if(counter == $scope.length*$scope.markers.length){
                //Do something here
            }
        };

        var errorFunction = function (data) {
            console.log("In errorFunction");
            console.log("Something went wrong: " + data['data']);

            $scope.flag=true;
        };

        function getSubscriptionList() {
            console.log("In getSubscriptionList");

            var subscriptionList = $filter('filter')($scope.chkbxs, {val: true});
            console.log("Just testing filter"+subscriptionList);

            for (var i = 0; i < subscriptionList.length; i++) {
                subscriptionList[i] = angular.lowercase(subscriptionList[i].label);

                console.log("the list "+subscriptionList[i]);
            }

            $scope.length = subscriptionList.length;
            console.log("length of subscriptionList:"+$scope.length);
            return subscriptionList;

        }

        $scope.addLocation = function(){
            console.log("in addLocation()");
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode( { "address": $scope.address }, function(results, status) {
                console.log($scope.address);
                var address =$scope.address;
                if (status == google.maps.GeocoderStatus.OK)
                {
                    console.log(results[0].geometry.location.lng());
                    $scope.addresses.push($scope.address);
                    $scope.$apply();
                    $scope.address='';
                    var marker = {
                        id: Date.now(),
                        coords: {
                            latitude: results[0].geometry.location.lat(),
                            longitude: results[0].geometry.location.lng()
                        },
                        title: address
                    };
                    $scope.markers.push(marker);
                    console.log('Bankai');
                    console.log($scope.markers.coords);
                    for (var i = 0, length = $scope.markers.length; i < length; i++) {
                        var marker = $scope.markers[i].coords;
                        console.log(marker);
                        bounds.extend(new google.maps.LatLng(marker.latitude, marker.longitude));
                    }
                    $scope.control.getGMap().fitBounds(bounds);
                    $scope.$apply();
                }
                else
                {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });
        }
       
        $scope.createEmergencies = function () {
            console.log("In subscribeToLocation");

            var subscriptionList = getSubscriptionList();
            for (var j = 0, length = $scope.markers.length; j < length; j++) {
                var marker = $scope.markers[j].coords;
                console.log("marker:"+ marker);
                for (i = 0; i < subscriptionList.length; i++) {
                    console.log("Subscribing for:" + subscriptionList[i]);
                    LokiGetter.postEmergency(marker, subscriptionList[i], emergencySuccessFunction, 
                        errorFunction);
                }
            }

        };
}]);