/* "Swhich": Scheduled control over Arduino-compatible boards via JavaScript;
 * Hardware-extensible via relays for control over AC power lines
 * 
 * Steven Jefferies & Tom Kruk
 * Last modified:  2015-12-15
*/

var fs = require("fs");
var http = require("http");
var path = require("path");
var url = require("url");
var util = require("util");

const PORT = 8888;

var bodyParser = require("body-parser");
var express = require("express");
var j5 = require("johnny-five");    // JavaScript Robotics framework (incl. Firmata compat.)
var $ = require("jquery");
var moment = require("moment");     // date-and-time library
//var momentTS = require("moment-timezone");
var _ = require("underscore");      // misc. useful functions, like sorting

var Teensy = new j5.Board();

// pin #s
const PINS = [23,22,21,13];

const DATETIME_FORMAT = "MMMM Do YYYY, h:mm:ss A";

const SEPARATOR = "\n========================================\n";

/*
    Wait for the Teensy (w/ StandardFirmata uploaded) to be active;
    no point in running the server without it
*/
Teensy.on("ready", function(){
    var j5Pins = new Array();
    var delay = 250;
    var x=0, y=0;
    
    // set up output pins:
    PINS.forEach(function(item){
        j5Pins.push( new j5.Pin(item) );
    });
    j5Pins.forEach(function(pin){
        pin.low();  // turn everything off at start
    });
    /*
    // test pattern on output pins:
    j5Pins.forEach(function(pin){
        x += delay;
        // do this when # ms has elapsed:
        Teensy.wait(x, function(){
            pin.high();
        });
        Teensy.wait(x+delay, function(){
            pin.low();
        });
    });
    */
    
    console.log( moment().format(DATETIME_FORMAT) );
    console.log("Teensy is ready; Firmata active.");
    
    var JSONurl = "/DATA.json";
    var JSONdata = JSON.parse( fs.readFileSync("."+JSONurl) );
    var JSONdataNEW = JSONdata; // start them as equal; do something when they're NOT equal
    
    var App = express();    // create an Express "Web Application"
    var server = App.listen(PORT, function(){
        console.log( moment().format(DATETIME_FORMAT) );
        console.log("Server up.  (localhost:%s)", server.address().port);
        //console.log( JSONdata );
        console.log(SEPARATOR);
    });
    
    // expose the subdirectories with files required by the client
    var arDirs = ["css", "fonts", "js"];
    for(x=0; x<arDirs.length; x++){
        App.use("/"+arDirs[x], express.static(arDirs[x]));
    }
    
    App.use(bodyParser.json());
    
    // Serve the client-side webpage if the client visits the server URL
    App.get("/", function(req, res){
        res.sendFile( path.join(__dirname+"/client.html") );
    });
    
    // Serve the JSON file when its URL is requested
    App.get(JSONurl, function(req, res){
        res.json(JSONdata);
        console.log( moment().format(DATETIME_FORMAT) );
        console.log("JSON data sent to client.\n");
        console.log( JSONdata );
        console.log(SEPARATOR);
    });
    
    // Receive updated JSON data from the client
    App.post("/update", function(req, res){
        console.log( moment().format(DATETIME_FORMAT) );
        console.log("Received updated JSON data:\n");
        
        JSONdataNEW = req.body;    // no need for JSON.parse(); already an object
        console.log( JSONdataNEW );
        console.log(SEPARATOR);
        
        if( checkData() ){  // if the incoming JSON is valid...
            // ... sort each pin's schedule by datetime
            JSONdataNEW.forEach(function(item){
                item.Schedule = _.sortBy(item.Schedule, "datetime");
                //console.log(item.Schedule);
            });
            // ...then update the JSON file
            JSONdata = JSONdataNEW;
            fs.writeFile( "."+JSONurl, JSON.stringify(JSONdata, null, "  "), function(err){
                if(err){
                    throw err;
                }
                console.log( moment().format(DATETIME_FORMAT) );
                console.log(JSONurl+" updated.");
                console.log(SEPARATOR);
            } );
            // ...and set the new pin states
        }
    });
    
    // validate incoming JSON data:
    function checkData(){
        //console.log(JSONdata.length);
        //console.log(JSONdataNEW.length);
        if( JSONdataNEW.length != JSONdata.length ){
            console.log("New data has wrong # of pins.  Ignoring.");
            console.log(SEPARATOR);
            return false;
        }
        //console.log( _.isEqual(JSONdataNEW,JSONdata) );
        if( _.isEqual(JSONdataNEW,JSONdata) ){  // Underscore's pre-built deep comparator
            console.log("JSON data hasn't changed.  Ignoring.");
            console.log(SEPARATOR);
            return false;
        }
        return true;
    }
    
    function updatePins(){
        x=0;
        j5Pins.forEach(function(pin){
            //console.log( JSONdata[x].scheduleActive );
            
            // Ignore schedule and turn on/off immediately
            if( !JSONdata[x].scheduleActive ){
                JSONdata[x].setState ? pin.high() : pin.low();    // true=ON, false=OFF
                console.log( "Pin " + x + ":\t" + (JSONdata[x].setState ? "ON" : "OFF") + " (override)" );
            }
            // if not, check schedule if pin should be on/off right now
            else {
                var This, info;
                // check each schedule item:
                JSONdata[x].Schedule.forEach(function(item, index){
                    This = moment(item.datetime, "HH:mm:ss");
                    //console.log( index + ":\t" + This.format(DATETIME_FORMAT) + "\t" + moment().isAfter(This) );
                    if( moment().isAfter(This) ){   // is now later than this schedule item?
                        y = index;  // store the last index that's before current time
                    }
                });
                
                console.log( "Pin " + x + ":\t" + JSONdata[x].Schedule[y].state );
                
                // pointlessly resetting to ON causes a blip; check if already on first
                pin.query(function(i){
                    info = i.state;
                });
                if( JSONdata[x].Schedule[y].state == "ON" && !info ){
                    pin.high();
                }
                else {  // interpret all invalid strings as OFF
                    pin.low();
                }
            }
            
            x++;
        });
    }
    
    // Synchronously update pin states:
    this.loop(500, function(){
        console.log( moment().format(DATETIME_FORMAT) );
        //console.log( moment("08:00:00", "HH:mm:ss").format(DATETIME_FORMAT) );
        updatePins();
        console.log("");
    });
});

