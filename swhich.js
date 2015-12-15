/* "Swhich": Scheduled control over Arduino-compatible boards via JavaScript;
 * Hardware-extensible via relays for control over AC power lines
 * 
 * Steven Jefferies & Tom Kruk
 * Last modified:  2015-12-14
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
//var jsonfile = require("jsonfile");
var moment = require("moment");     // date-and-time library
//var momentTS = require("moment-timezone");
var _ = require("underscore");  //

var Teensy = new j5.Board();

const LOW = 0;
const HIGH = 1;

// pin #s
const OUTLET = [23,22,21,13];

const lineBreak = "\n========================================\n";

/*
    Wait for the Teensy (w/ StandardFirmata uploaded) to be active;
    no point in running the server without it
*/
Teensy.on("ready", function(){
    var j5Pins = new Array();
    var delay=250, x=0;
    
    // set up output pins:
    OUTLET.forEach(function(item){
        j5Pins.push( new j5.Pin(item) );
    });
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
    
    console.log("Teensy is ready; Firmata active.");
    
    var JSONurl = "/DATA.json";
    var JSONdata = JSON.parse( fs.readFileSync("."+JSONurl) );
    var JSONdataNEW = JSONdata; // start them as equal; do something when they're NOT equal
    
    var App = express();    // create an Express "Web Application"
    var server = App.listen(PORT, function(){
        console.log("Server up.  (localhost:%s)", server.address().port);
        //console.log( JSONdata );
        console.log(lineBreak);
    });
    
    // serve the directories with files required by the client
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
        console.log("JSON data sent to client.\n");
        console.log( JSONdata );
        console.log(lineBreak);
    });
    
    // Receive updated JSON data from the client
    App.post("/update", function(req, res){
        console.log("Received updated JSON data:\n");
        JSONdataNEW = req.body;    // no need for JSON.parse(); already an object
        console.log( JSONdataNEW );
        console.log(lineBreak);
        
        if( checkData() ){  // if the incoming JSON is valid...
            JSONdata = JSONdataNEW;
            // ... sort each outlet's
            JSONdata.forEach(function(item){
                _.sortBy(item.Schedule, "datetime");
            });
            // ...then update the JSON file
            fs.writeFile( "."+JSONurl, JSON.stringify(JSONdata, null, "  "), function(err){
                if(err){
                    throw err;
                }
                console.log(JSONurl+" updated.");
                console.log(lineBreak);
            } );
            // ...and set the new pin states
        }
    });
    
    // validate incoming JSON data:
    function checkData(){
        //console.log(JSONdata.length);
        //console.log(JSONdataNEW.length);
        if( JSONdataNEW.length != JSONdata.length ){
            console.log("New data has wrong # of outlets.  Ignoring.");
            console.log(lineBreak);
            return false;
        }
        //console.log( _.isEqual(JSONdataNEW,JSONdata) );
        if( _.isEqual(JSONdataNEW,JSONdata) ){  // Underscore's pre-built deep comparator
            console.log("JSON data hasn't changed.  Ignoring.");
            console.log(lineBreak);
            return false;
        }
        return true;
    }
    
    function setOutlets(){
        
    }
    
    // Synchronously update pin states:
    this.loop(1000, function() {
        //console.log( moment().format('MMMM Do YYYY, h:mm:ss A') );
        console.log( moment("08:00:00", "HH:mm:ss").format('MMMM Do YYYY, h:mm:ss A') );
    });
});

