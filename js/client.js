var JSONdata = [];
var ScheduleList = [];
var numSchedules = 0;

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
		checkTime(onOff.value, true, clock.value);
		break;
	case "on":
		checkTime("ON", false, clock.value);
		break;
	case "off":
		checkTime("OFF", false, clock.value);
		break;
	}
	output.value = JSON.stringify(JSONdata, null, "  ");
	
	
}
function addLine(myID, myclock, myonOff){ 
	//Creates a new entry in the schedule section of the webpage for the current values
	
        var box_html = $('<p id="scheduleBox' + numSchedules + '" relay="' + myID + '" theclock="' + clock.value +'"><label for="box' + numSchedules + '" style="float:left;">Schedule <span class="box-number">' + numSchedules + '</span></label><br><select value="" id="onSched' + numSchedules + '" style="float:left;clear: left;" ><option value="ON">On</option><option value="OFF">Off</option></select><br><input type="time" id="clock' + numSchedules + '" step="1"  style="float:left; clear:left;" value="00:00:01"/>&nbsp <br><input onclick="updateLine(' + numSchedules + ',clock' + numSchedules + '.value, onSched' + numSchedules + '.value)" type="button" class="btn btn-sucess" value="Update" style="float:left; clear: left;"/><input onclick="removeLine(' + numSchedules + ')" type="button" id="removeButton" class="btn btn-danger" value="Remove" style="float:left;"></input></p>');
        box_html.hide();
		//Adds the above element to the page
        $('#Relay' + myID + '').append(box_html);   
        box_html.fadeIn('slow');
		//Updates the inputs to be the currently set values
		$('#clock' + numSchedules + '').val(myclock);
		$('#onSched' + numSchedules + '').val(myonOff);
		//Adds the new page elements to the schedule
		ScheduleList.push({id:myID, state:myonOff, datetime: myclock, active:true});
		numSchedules++;
		
		//Thanks to http://websistent.com/dynamic-textbox-jquery-php/
}

function removeLine(lineNum){
	$('#scheduleBox' + lineNum	+ '').fadeOut("slow", null, function(){
		$('#scheduleBox' + lineNum	+ '').remove();
		});
	console.log('scheduleBox' + lineNum	+ '');
	var z = $('#scheduleBox' + lineNum	+ '');
	removeSched(ScheduleList[lineNum].id, ScheduleList[lineNum].datetime);
	ScheduleList[lineNum].active = false;
}
function updateLine(lineNum, myclock, myonOff){
	//Updates the values contained in a schedule entry when individual update button is pressed
	for (x in JSONdata[ID.value]["Schedule"]){
	if (JSONdata[ScheduleList[lineNum].id]["Schedule"][x]["datetime"] == ScheduleList[lineNum].datetime && ScheduleList[lineNum].active == true){ 
			//If the current clock value is equal to any time already in the schedule
			//Update the values of the clock instead of creating a new one
				JSONdata[ScheduleList[lineNum].id]["Schedule"][x]["datetime"] = myclock;
				JSONdata[ScheduleList[lineNum].id]["Schedule"][x]["state"] = myonOff;
			}
	}
	
	ScheduleList[lineNum].datetime = myclock;
	ScheduleList[lineNum].state = myonOff;
	output.value = JSON.stringify(JSONdata, null, "  ");
	//JSONdata[ScheduleList[lineNum].id] = 
}

function send(){
	//Sends JSONdata to server
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
	//Recieves JSONdata from server, then places it in the schedule
	var timeFound = false;
	$.get("DATA.json", function(DATA){
		JSONdata = DATA;
		output.value = JSON.stringify(JSONdata, null, "  ");
		console.log("Data Recieved");
		
		//Add each line loaded to the Schedule
		for (x in JSONdata){
			for (y in JSONdata[x]["Schedule"]){ 
			//For each JSONdata[0-end]["Schedule"][0-end]
				addLine(JSONdata[x].id, JSONdata[x]["Schedule"][y]["datetime"],JSONdata[x]["Schedule"][y]["state"] );
				
			}
		}
	}

	);
	
}
function checkTime(stateVal, schedVal, clockVal){
	//checks if the currently chosen time is already on the schedule and updates the JSONdata accordingly
	var timeFound = false;
	var setVal = false;
	if (stateVal =="ON" && schedVal == false)
		setVal = true;

	if (JSONdata[ID.value]){ //If there is an object for the current ID
		for (x in JSONdata[ID.value]["Schedule"]){
			if (JSONdata[ID.value]["Schedule"][x]["datetime"] == clockVal){ 
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
			JSONdata[ID.value]["Schedule"].push({state: stateVal, datetime: clockVal});
			JSONdata[ID.value]["setState"] = setVal;
			JSONdata[ID.value]["scheduleActive"] = schedVal;
			addLine(ID.value, clockVal, stateVal);
		}
	}
	else{ //If there is no object, create it
		JSONdata.push({"id":ID.value, "scheduleActive": schedVal, "setState": setVal, "Schedule": [{state:stateVal, datetime: clock.value}]});
		addLine(ID.value, clockVal, stateVal);
	}
}
function deleteSched(){ //Used for deletion through buttonDelete 
	removeSched(ID.value, clock.value);
}

function removeSched(idVal, clockVal){
	for (x in JSONdata[idVal]["Schedule"]){
		if (JSONdata[idVal]["Schedule"][x]["datetime"] == clockVal){ 
			JSONdata[idVal]["Schedule"].splice(x,1);
		}
	}
	output.value = JSON.stringify(JSONdata, null, "  ");
}


$(document).ready(function(){   // When the HTML data is fully loaded:
    load();     // 1) Grab the JSON data from the server 
});
