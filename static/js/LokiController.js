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
    }
]);