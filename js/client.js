var JSONdata = [];

/*
var JSONdata = [{
	"id":0,
	"scheduleActive": true,
	"Schedule": [
           {"state": "ON", "datetime": "08:00:00"}]
	},{},{},{}]
*/ //JSON file format for reference

function update(){
	switch(mode.value){ 
	case "normal":
	
	 if (JSONdata[ID.value]){ //If there is an object for the current ID
	  JSONdata[ID.value]["Schedule"].push({state:"ON", datetime: clock.value});
			JSONdata[ID.value]["scheduleActive"] = true;}
			
	 else{ //If there is no object, create it
	  JSONdata.push({"id":ID.value, "scheduleActive": true, "Schedule": [{state:"ON", datetime: clock.value}]});}
		break;
		
	case "on":
	
	 if (JSONdata[ID.value]){ //If there is an object for the current ID
	  JSONdata[ID.value]["Schedule"].push({state:"ON", datetime: clock.value});
		 JSONdata[ID.value]["scheduleActive"] = false;}
	 else{ //If there is no object, create it
		JSONdata.push({"id":ID.value, "scheduleActive": false, "Schedule": [{state:"ON", datetime: "00:00"}]});}
		break;
		
	case "off":
	
	if (JSONdata[ID.value]){ //If there is an object for the current ID
	  JSONdata[ID.value]["Schedule"].push({state:"OFF", datetime: clock.value});
		 JSONdata[ID.value]["scheduleActive"] = false;}
	 else{ //If there is no object, create it
		JSONdata.push({"id":ID.value, "scheduleActive": false, "Schedule": [{state:"OFF", datetime: "00:00"}]});}
		break;
	}
	output.value= JSON.stringify(JSONdata);
	
}
function send(){
	JSONdata = JSON.parse(output.value);
 $.post("localhost:8888", JSONdata)

 console.log("Data sent");
}
function load(){
 $.get("DATA.json", function(DATA){
 
 JSONdata = DATA;
 output.value= JSON.stringify(JSONdata);
 });
 console.log("Data Recieved");
}
$(document).ready(function(){load();}); //Loads the file from the server when the page loads