app.factory('EmergenciesGetter',function(){
console.log('Hello');
var emergency=[
            {label: "Earthquake", val: false},
            {label: "Hurricane", val: false},
            {label: "Tornado", val: false},
            {label: "Flood", val: false},
            {label: "Shooting", val: false}
        ];
return emergency;
	
});