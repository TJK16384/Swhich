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
var jsonfile = require("jsonfile");
var moment = require("moment");     // date-and-time library
//var momentTS = require("moment-timezone");

var Teensy = new j5.Board();

const LOW = 0;
const HIGH = 1;

// pin #s
const OUTLET = [23,22,21,13];

/*
    Wait for the Teensy (w/ StandardFirmata uploaded) to be active;
    no point in running the server without it
*/
Teensy.on("ready", function(){
    var x=0;
    
    // test pattern on output pins:
    var j5Pins = [];
    for(x=0; x<OUTLET.length; x++){
        j5Pins[x] = new j5.Pin(OUTLET[x]);
        j5Pins[x].high();
        //sleep(500,function(){});
        j5Pins[x].low();
    }
    
    console.log("Teensy is ready; Firmata active.");
    
    var JSONurl = "/DATA.json";
    var JSONdata = JSON.parse( fs.readFileSync("."+JSONurl) );
    
    var App = express();    // create an Express "Web Application"
    var server = App.listen(PORT, function(){
        console.log("Server up.  (localhost:%s)", server.address().port);
        console.log( JSONdata );
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
        console.log("JSON data sent to client.");
    });
    
    // Receive updated JSON data from the client
    App.post("/update", function(req, res){
        console.log("Received updated JSON data; saving...");
        console.log( req.body );
    });
    
    // No need for synchronous operation below; async. requests will come in
    /*
    this.loop(1000, function() {
        console.log( moment().format('MMMM Do YYYY, h:mm:ss A') );
    });
    */
});

