//pitf-analysis.js combines the pts & pitf datasets, and adds a 'duration' value
//for the length of the conflict

//It does calculate exact durations, but for the purposes of the visualization
//the data is used in, rounds them off to year (rather than months)

var fs = require('fs');
var async = require('async');
var d3 = require('d3');

var pts = JSON.parse(fs.readFileSync('pts-nested.json', 'utf8'));
//var region 

fs.readFile("data/pitf.tsv", "utf8", function(error, data) { // from http://learnjsdata.com/node.html
    data = d3.tsvParse(data);
    
    for (var event in data) {
        console.log(event);
        
        if (data[event].country != undefined) {
            console.log(data[event].country);
            //Parse years
            data[event].began = parseYear(data[event].began);
            data[event].ended = parseYear(data[event].ended);
            
            //Calc and add Duration. Using 2017 to calculate duration of currently ongoing conflicts.
            var endYear = data[event].ended;
            if (endYear == 'ONGOING') {
                endYear = 2017;
            }
            
            var countryCodes = data[event].country.split(' ');
            var countryCode = countryCodes[0].replace(',','')+countryCodes[1];
            countryCode = countryCode.toLowerCase().replace('undefined','');
            console.log(countryCode);
            
            data[event].duration = endYear - data[event].began;
            data[event].duration = data[event].duration.toFixed(2);
            data[event].countryCode = countryCode;
            
            var began = Math.floor(data[event].began);
            if (began < 1976 && data[event].ended > 1976) { began = 1976; }
            console.log('began '+began);
            
            //construct pitf object
            if (began >= 1976) {
                
                console.log('make new pitf object for pts');
                
                var pitf = new Object()
                pitf.duration = Math.floor(data[event].duration);
                pitf.began = Math.floor(data[event].began);
                pitf.ended = Math.floor(data[event].ended);
                pitf.conflictType = data[event].conflictType;
                pitf.eventDescription = data[event].eventDescription;
                var check = pitf.eventDescription.slice(0, 15);
                console.log('PTS------'+check);
                
                //push to pts
                pts[countryCode].pitf.push(pitf);
            }
            
            
            
        // get rid of junk
        } else {
            data.splice(event, 1);
        }
    }
    
    fs.writeFile('pitf-mod1.json', JSON.stringify(data), function(err) {
        if (err) {throw err;}
        console.log("done");
    });
    
    fs.writeFile('pts+pitf.json', JSON.stringify(pts), function(err) {
        if (err) {throw err;}
        console.log("pts+pitf written");
    });
    
});

function parseYear(yearString) {
    
    if (yearString != '-') {
        
        var month = yearString.split('/')[0];
        var year = yearString.split('/')[1];
        month = (parseFloat(month)-1)/12;
        var yearDec = parseFloat(year)+month
        return yearDec.toFixed(2);
        
    } else {
        
        return 'ONGOING';
    }
        
}