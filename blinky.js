var j5 = require("johnny-five");

var Teensy = new j5.Board();

var RED = 23;
var GREEN = 22;
var BLUE = 21;

var OUTPUT = 1;

var LOW = 0;
var HIGH = 1;


Teensy.on("ready", function(){
    var rgb = new j5.Led.RGB({
        pins: [RED,GREEN,BLUE],
        isAnode: false
    });
    
    var V, x=0;
    
    this.loop(25, function() {
        V = 100 * ( 0.5 - 0.5 * Math.cos(x * Math.PI/100) );
        
        x++;
        if(x>200){
            x=0;
        }
        
        rgb.intensity(V);
        console.log(V);
    });
    
});
