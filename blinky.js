var j5 = require("johnny-five");
var $ = require("jquery");

var Teensy = new j5.Board();

var RED = 23;
var GREEN = 22;
var BLUE = 21;

var OUTPUT = 1;

var LOW = 0;
var HIGH = 1;


Teensy.on("ready", function(){
    var V, x=0, delay=500;
    var LEDs = [ new j5.Led(RED), new j5.Led(GREEN), new j5.Led(BLUE), new j5.Led(13) ];
    
    // indexing wasn't working properly; use for each loop instead:
    LEDs.forEach(function(item){
        x += delay;
        // do this when # ms has elapsed:
        Teensy.wait(x, function(){
            item.on();
        });
        Teensy.wait(x+delay, function(){
            item.off();
        });
    });
    
    /*
    this.loop(25, function() {
        V = 100 * ( 0.5 - 0.5 * Math.cos(x * Math.PI/100) );
        
        x++;
        if(x>200){
            x=0;
        }
        
        RGB.intensity(V);
        console.log(V);
    });
    */
});
