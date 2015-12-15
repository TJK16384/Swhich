var JSONdata = [];

/*
var JSONdata = [{
	"id":0,
	"scheduleActive": true,
	"setState": false,  // OFF
	"Schedule": [
		{"state": "ON", "datetime": "08:00:00"}]
	},{},{},{}]
*/ //JSON file format for reference

function update(){
	switch(mode.value){ 
	
	case "normal":
		checkTime(onOff.value, true);
		break;
	case "on":
		checkTime("ON", false);
		break;
	case "off":
		checkTime("OFF", false);
		break;
	}
	output.value = JSON.stringify(JSONdata, null, "  ");
	
}
function send(){
	JSONdata = output.value;
    $.ajax({
        url: "./update",
        type: "POST",
        contentType: "application/json",
        data: JSONdata,
        dataType: "json",
        success: function(data){
            // On success, do this:
            console.log("Data sent");
        },
        error: function(xhr, ajaxOptions, thrownError) {
            // On error, do this
            $.mobile.loading('hide');
            if (xhr.status == 200) {
                alert(ajaxOptions);
            }
            else {
                alert(xhr.status);
                alert(thrownError);
            }
        }
    });
}
function load(){
	$.get("DATA.json", function(DATA){
		JSONdata = DATA;
		output.value = JSON.stringify(JSONdata, null, "  ");
		console.log("Data Recieved");
	});
}
function checkTime(stateVal, schedVal){
	//checks if the currently chosen time is already on the schedule and updates the JSONdata accordingly
	var timeFound = false;
	var setVal = false;
	if (stateVal =="ON" && schedVal == false)
		setVal = true;

	if (JSONdata[ID.value]){ //If there is an object for the current ID
		for (x in JSONdata[ID.value]["Schedule"]){
			if (JSONdata[ID.value]["Schedule"][x]["datetime"] == clock.value){ 
			//If the current clock value is equal to any time already in the schedule
			//Update the values of the clock instead of creating a new one
				JSONdata[ID.value]["setState"] = setVal;
				JSONdata[ID.value]["Schedule"][x]["state"] = stateVal;
				JSONdata[ID.value]["scheduleActive"] = schedVal;
				timeFound = true;
			}
		}
		//Create a new entry for the time if not found in the schedule
		if (!timeFound){ 
			JSONdata[ID.value]["Schedule"].push({state: stateVal, datetime: clock.value});
			JSONdata[ID.value]["setState"] = setVal;
			JSONdata[ID.value]["scheduleActive"] = schedVal;
		}
	}
	else{ //If there is no object, create it
		JSONdata.push({"id":ID.value, "scheduleActive": schedVal, "setState": setVal, "Schedule": [{state:stateVal, datetime: clock.value}]});
	}
}

function removeSched(){
	for (x in JSONdata[ID.value]["Schedule"]){
		if (JSONdata[ID.value]["Schedule"][x]["datetime"] == clock.value){ 
			JSONdata[ID.value]["Schedule"].splice(x,1);
		}
	}
	output.value = JSON.stringify(JSONdata, null, "  ");
}


$(document).ready(function(){   // When the HTML data is fully loaded:
    load();     // 1) Grab the JSON data from the server 
});
