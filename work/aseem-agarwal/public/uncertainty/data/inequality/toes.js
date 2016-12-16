var fs = require('fs');
var csv = require('csv');
var deferred = require('deferred');
var data,headers, rows, ctAtOnce = 10000;

var elasticsearch = require('elasticsearch');
//var hostu = "http://localhost:9200";
var hostu = 'http://search-undp-uhzzk2e4xmpuedy3ys6war7364.us-east-1.es.amazonaws.com/';
var client = new elasticsearch.Client({
  host: hostu
});


var countryCodes = {
        "Algeria" : "DZA",
        "Somalia" : "SOM",
        "South Africa" : "ZAF",
        "Republic of the Congo" : "COD",
        "Sudan" : "SDN",
        "Nigeria" : "NGA",
        "Angola" : "AGO",
        "Uganda" : "UGA",
        "Ethiopia" : "ETH",
        "Sierra Leone" : "SLE",
        "Burundi" : "BDI",
        "Central African Republic (CAR)" : "CAF",
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
        "Cabo Verde" : "CPV",
        "Egypt" : "EGY",
        "Gambia" : "GMB",
        "Malawi" : "MWI",
        "Mauritius" : "MUS",
        "Sao Tome And Principe" : "STP",
        "Seychelles" : "SYC",
        "Gabon" : "GAB"
 };

function elPost(events){
  var def1 = deferred(), stmts=[];
  for(var i=0;i<events.length;i++){
    stmts.push({ index:  { _index: 'ineq', _type: 'ineq_country_year' } });
    stmts.push(events[i]);
  }
  client.bulk({
    body: stmts
  }, function (error, response) {
      def1.resolve();
  });
  return def1.promise;
}

var parser =function(data ){
  data = JSON.parse(data);
   var toPost = [];
  for(var i=0;i<data.length;i++){
      var ob = data[i], obj = {};
      if(countryCodes[ob["country"]]){
        obj["value"] = parseFloat(ob["giniAvg"]);
        obj["ccode"] = countryCodes[ob["country"]];
        obj["c_name"] = ob["country"];
        obj["yr"] = parseInt(ob["year"]);
        toPost.push(obj);
      }else{
        console.log(ob["country"]);
      }
  }
  console.log("posting - " + toPost.length);
  var promise = elPost(toPost);
  promise.done(function(){
    console.log("posted");
  });
};

parser(fs.readFileSync('ineq.json'));

