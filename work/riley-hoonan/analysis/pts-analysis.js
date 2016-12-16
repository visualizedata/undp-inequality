// PTS Analysis reads the Political Terror Scale data (pts.csv)
// averages the three scores (mean)
// and collects meta data in trends from those averages

// DATA STRUCTURES:
// pts-simple.json includes PTS average per year per country in an easily converted format
// pts-meta.json shows only metadata for each country in an easily-converted format
// pts-nested.json includes all of the data mentioned above and is meant to be combined with wiid gini data for use in website

var fs = require('fs');
var async = require('async');
var d3 = require('d3');

//Global storage
var countries = {};
var countriesMeta = [];

function pushNum(isNum, toArray) {
    if (!isNaN(parseFloat(isNum))) {
        toArray.push(parseFloat(isNum));
    }
}

function calcAvg(itemsToAvg) {
    
    //itemsToAvg is an array of datapoints
    var sum = itemsToAvg.reduce(function(a, b) { // <- MDN
        return a + b;
    }, 0);
    
    //if there is data
    if (sum != 0) { 
        var avg = (sum/itemsToAvg.length).toFixed(2);
    //use 0 for no data (ratings are always 1 - 5)
    } else if (itemsToAvg.length == 0) { 
        var avg = 0; 
    }
        
    return avg;
}

function Country(fullName) {
    this.years = {};
    this.name = fullName;
    this.pitf = [];
}

function Year(ptsAvg) {
    this.ptsAvg = ptsAvg;
}

fs.readFile("data/pts.csv", "utf8", function(error, data) {
    data = d3.csvParse(data);
    
    //get rid of 'columns' array
    delete data['columns'];
    
    for (var datum in data) {
        // yes 1976 is here...
        //remove country_OLD
        delete data[datum].Country_OLD;
        
        //average PTS scores into single PTS score and consolidate
        var ptsArr = [];
        // calc average
        pushNum(data[datum].ptsa, ptsArr);
        pushNum(data[datum].ptsh, ptsArr);
        pushNum(data[datum].ptss, ptsArr);
        var ptsAvg = calcAvg(ptsArr);
        // remove old data
        data[datum].ptsAvg = ptsAvg;
        
        delete data[datum].ptsa;
        delete data[datum].ptsh;
        delete data[datum].ptss;
        
        // restructure data - index by country and then by year 
        var countryCodes = data[datum].country.split(' ');
        var countryCode = countryCodes[0].replace(',','')+countryCodes[1];
        countryCode = countryCode.toLowerCase().replace('undefined','');

        var country = data[datum].country;
        // year index
        if (datum == 0) {
            
            console.log(data[datum].year);
            console.log(countryCode);
            
            //handle initial case
            countries[countryCode] = new Object();
            countries[countryCode].years = new Object();
            countries[countryCode].name = country;
            countries[countryCode].pitf = [];
            countries[countryCode].years[1976]= new Year(ptsAvg);
            // countries[countryCode] = new Country(country);
            // countries[countryCode].years[year] = new Year(ptsAvg);
            console.log(countries[countryCode]);
            
        } else { 
            var prev = datum-1;
            var year = data[datum].year;
            if (country != data[prev].country) {
                countries[countryCode] = new Country(country);
                countries[countryCode].years[year] = new Year(ptsAvg);
            } else {
                countries[countryCode].years[year] = new Year(ptsAvg);
            }
        }
        
    }
    
    // console.log(JSON.stringify(countries));
    // console.log(data);
    
    //fallback data structure
    fs.writeFile('pts-simple.json', JSON.stringify(data), function(err) {
        if (err) {throw err;}
        console.log("pts-simple written");
    });
    
    countryAvgs();
    
    //better data structure
    fs.writeFile('pts-nested.json', JSON.stringify(countries), function(err) {
        if (err) {throw err;}
        console.log("pts-nested written");
    });
    
    //create a meta-data excel-friendly data object
    fs.writeFile('pts-meta.json', JSON.stringify(countriesMeta), function(err) {
        if (err) {throw err;}
        console.log("pts-meta written");
    });
    
});

//calculate overall averages for each country
function countryAvgs() {
    
    var i = 0;
    for (var country in countries) {
        //collect averages for the last five years, last ten years, and overall PTS
        var allPTS = [];
        var current = countries[country];
        
        for (var year in current.years) {
            if (current.years[year].ptsAvg != 0) { // catch error on empties
                pushNum(current.years[year].ptsAvg, allPTS);
            }
        }
        // console.log(allPTS);
        
        //get averages
        current.overallPTS = calcAvg(allPTS);
        current.tenYearPTS = calcAvg(allPTS.splice(0, allPTS.length-10));
        current.fiveYearPTS = calcAvg(allPTS.splice(0, allPTS.length-5));

        //find min max and range
        current.max = d3.max(allPTS); 
        current.min = d3.min(allPTS);
        current.range = current.max-current.min;
        current.range = current.range.toFixed(2);
        // console.log('max: '+current.max+' min: '+current.min+' range: '+current.range);
        
        // excel-friendly meta data
        countriesMeta[i] = new Object();
        countriesMeta[i] = current;
        // delete countriesMeta[i].years;
        i++;
        
    }
}