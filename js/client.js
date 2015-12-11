var JSONdata = [];
fs = require('fs');
var options = {
  port: 80,
  method: 'POST'
};

var settings = {
 data: JSON.stringify(JSONdata),
 url: "./DATA.json",
 type: "POST",
 contentType: "application/json"
 //dataType:"jsonp"
};

/*
var JSONdata = [{
	"id":0,
	"scheduleActive": true,
	"Schedule": [
           {"state": "ON", "datetime": "08:00:00"}]
	},{},{},{}]
*/

function update(){
	switch(mode.value){ 
	case "normal":
		JSONdata.push({"id":ID.value, "scheduleActive": "ON", "Schedule": [{state:"ON", datetime: clock.value}]});
		break;
	case "on":
		JSONdata.push({"id":ID.value, "scheduleActive": "OFF", "Schedule": [{state:"ON", datetime: "00:00"}]});
		break;
	case "off":
		JSONdata.push({"id":ID.value, "scheduleActive": "OFF", "Schedule": [{state:"OFF", datetime: "00:00"}]});
		break;
	}
	output.value= JSON.stringify(JSONdata);
}
function send(){
 //settings.data = output.value;
 //$.ajax(settings);
fs.writeFile("./data.json", JSONdata);

 console.log("Data sent");
}
function load(){
 $.get("./data.json", function(DATA){
 
 JSONdata = DATA;
 output.value= JSON.stringify(JSONdata);
 });
 console.log("Data Recieved");
}