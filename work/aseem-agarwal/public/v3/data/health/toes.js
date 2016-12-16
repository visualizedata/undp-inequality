var fs = require('fs');
var csv = require('csv');
var deferred = require('deferred');
var data,headers, rows, ctAtOnce = 10000;

var elasticsearch = require('elasticsearch');
// var hostu = "http://localhost:9200";
var hostu = 'http://35.161.122.132:9200/';
var client = new elasticsearch.Client({
  host: hostu
});


var countryCodes = {
        "Algeria" : "DZA",
        "Somalia" : "SOM",
        "South Africa" : "ZAF",
        "Democratic Republic of the Congo" : "COD",
        "Sudan" : "SDN",
        "Nigeria" : "NGA",
        "Angola" : "AGO",
        "Uganda" : "UGA",
        "Ethiopia" : "ETH",
        "Sierra Leone" : "SLE",
        "Burundi" : "BDI",
        "Central African Republic" : "CAF",
        "Kenya" : "KEN",
        "Rwanda" : "RWA",
        "Liberia" : "LBR",
        "Libya" : "LBY",
        "South Sudan" : "SSD",
        "Chad" : "TCD",
        "Mali" : "MLI",
        "Senegal" : "SEN",
        "Mozambique" : "MOZ",
        "Cote d'Ivoire" : "CIV",
        "Congo" : "COG",
        "Cameroon" : "CMR",
        "Niger" : "NER",
        "Togo" : "TGO",
        "Guinea" : "GIN",
        "Equatorial Guinea" : "GNQ",
        "Zimbabwe" : "ZWE",
        "Djibouti" : "DJI",
        "Eritrea" : "ERI",
        "Madagascar" : "MDG",
        "Ghana" : "GHA",
        "Mauritania" : "MRT",
        "Guinea-Bissau" : "GNB",
        "Namibia" : "NAM",
        "Tanzania" : "TZA",
        "Zambia" : "ZMB",
        "Morocco" : "MAR",
        "Comoros" : "COM",
        "Lesotho" : "LSO",
        "Swaziland" : "SWZ",
        "Tunisia" : "TUN",
        "Botswana" : "BWA",
        "Benin" : "BEN",
        "Burkina Faso" : "BFA",
        "Cape Verde" : "CPV",
        "Egypt" : "EGY",
        "The Gambia" : "GMB",
        "Malawi" : "MWI",
        "Mauritius" : "MUS",
        "Sao Tome and Principe" : "STP",
        "Seychelles" : "SYC",
        "Gabon" : "GAB"
 };

function elPost(events){
  var def1 = deferred(), stmts=[];
  for(var i=0;i<events.length;i++){
    stmts.push({ index:  { _index: 'health', _type: 'deaths' } });
    stmts.push(events[i]);
  }
  client.bulk({
    body: stmts
  }, function (error, response) {
      def1.resolve();
  });
  return def1.promise;
}


var parser = csv.parse({delimiter: ','}, function(err, d ){
  data = d;
  headers = data[0];
  console.log(data.length);
  var toPost = [];
  var countries = {};
  var yrCountry = {};
  var notpresnt = [];
  for(var i=1;i<data.length;i++){
    var row = data[i];
    if(countryCodes[row[1]]){
      // var yr = "" + row[12];
      // var coun = row[3];
      // yrCountry[yr] = yrCountry[yr] || {};
      // yrCountry[yr][coun] = yrCountry[yr][coun] || 0;
      // yrCountry[yr][coun] += parseFloat(row[13]*100);
       toPost.push({
         "yr" : parseInt(row[6]),
         "ccode" : countryCodes[row[1]],
         "value" : parseFloat(row[7])
       });

    }
  }
  console.log("posting - "+toPost.length);
  var promise = elPost(toPost);
  promise.done(function(){
    console.log("posted");
  });
});

fs.createReadStream('deaths_rate_100k.csv').pipe(parser);


