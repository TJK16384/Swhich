var http = require("http");
const PORT = 8888;

var fs = require("fs");
var dispatcher = require("httpdispatcher");
var j5 = require("johnny-five");    // JavaScript Robotics framework (incl. Firmata compat.)
var $ = require("jquery");
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


function handleRequest(request, response){
    /*
     * HANDLE INCOMING JSON DATA HERE
    */
    //response.end("It Works!! Path Hit: " + request.url);
    response.end( moment("2015-09-09 12").toString() ); // test string for moment.js
}


Teensy.on("ready", function(){
    console.log("Teensy is ready; Firmata active.");
    
    // Many thanks to http://blog.modulus.io/build-your-first-http-server-in-nodejs
    var server = http.createServer(handleRequest);
    server.listen(PORT, function(){
        //Callback triggered when server starts listening on a port
        console.log("Server running.  (localhost:" + PORT + ")");
    });
    
    // No need for synchronous operation below; async. requests will come in
    /*
    this.loop(1000, function() {
        console.log( moment().format('MMMM Do YYYY, h:mm:ss A') );
    });
    */
});

