var fs = require("fs");
var http = require("http");
var path = require("path");
var url = require("url");
var util = require("util");

const PORT = 8888;

//var dispatcher = require("httpdispatcher");
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
const OUTLET1 = 23;
const OUTLET2 = 22;
const OUTLET3 = 21;
const OUTLET4 = 13;


/*
    Wait for the Teensy (w/ StandardFirmata uploaded) to be active;
    no point in running the server without it
*/
Teensy.on("ready", function(){
    console.log("Teensy is ready; Firmata active.");
    
    var App = express();    // create an Express "Web Application"
    var server = App.listen(PORT, function(){
        console.log("Server up.  (localhost:%s)", server.address().port);
    });
    
    var JSONurl = "/DATA.json";
    var JSONdata = JSON.parse( fs.readFileSync("."+JSONurl) );
    /*
    jsonfile.readFile(JSONurl, function(err, obj){
        console.log("JSON READ ERROR:\t" + obj);
    });
    */
    
    // serve the directories with files required by the client
    var arDirs = ["css", "fonts", "js"];
    for(var x=0; x<arDirs.length; x++){
        App.use("/"+arDirs[x], express.static(arDirs[x]));
    }
    
    App.get("/", function(req, res){
        res.sendFile( path.join(__dirname+"/client.html") );
    });
    
    App.get(JSONurl, function(req, res){
        res.json(JSONdata);
        console.log("JSON data sent to client.");
    });
    
    App.post("/update", function(req, res){
        console.log("Received new JSON data; saving...");
    });
    
    // No need for synchronous operation below; async. requests will come in
    /*
    this.loop(1000, function() {
        console.log( moment().format('MMMM Do YYYY, h:mm:ss A') );
    });
    */
});

