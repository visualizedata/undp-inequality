var fs = require('fs');
var csv = require('csv');
var deferred = require('deferred');
var data,headers, rows, ctAtOnce = 10000;

var elasticsearch = require('elasticsearch');
// var hostu = "http://localhost:9200";
var hostu = "http://35.161.122.132:9200"
var client = new elasticsearch.Client({
  host: hostu
});


var countryCodes = [
         "DZA",
         "SOM",
         "ZAF",
         "COD",
         "SDN",
         "NGA",
         "AGO",
         "UGA",
         "ETH",
         "SLE",
         "BDI",
         "CAF",
         "KEN",
         "RWA",
         "LBR",
         "LBY",
         "SSD",
         "TCD",
         "MLI",
         "SEN",
         "MOZ",
         "CIV",
         "COG",
         "CMR",
         "NER",
         "TGO",
         "GIN",
         "GNQ",
         "ZWE",
         "DJI",
         "ERI",
         "MDG",
         "GHA",
         "MRT",
         "GNB",
         "NAM",
         "TZA",
         "ZMB",
         "MAR",
         "COM",
         "LSO",
         "SWZ",
         "TUN",
         "BWA",
         "BEN",
         "BFA",
         "CPV",
         "EGY",
         "GMB",
         "MWI",
         "MUS",
         "STP",
         "SYC",
         "GAB"
 ];

function elPost(events){
  var def1 = deferred(), stmts=[];
  for(var i=0;i<events.length;i++){
    stmts.push({ index:  { _index: 'gdp', _type: 'gdp_c' } });
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
  for(var i=1;i<data.length;i++){
    var row = data[i];
    if(countryCodes.indexOf(row[1])>-1 ){
      for(var j=4;j<row.length;j++){
        toPost.push({
          "yr" : parseInt(headers[j]),
          "ccode" : row[1],
          "value" : parseFloat(row[j]),
          "cname" : row[0]
        })  
      }
    }
  }
  console.log("posting - "+toPost.length);
  var promise = elPost(toPost);
  promise.done(function(){
    console.log("posted");
  });
});

fs.createReadStream('gdp.csv').pipe(parser);


