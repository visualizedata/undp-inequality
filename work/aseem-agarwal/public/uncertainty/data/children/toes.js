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

var countryCodes = ["DZA","SOM","ZAF","COD","SDN","NGA","AGO","UGA","ETH","SLE","BDI","CAF","KEN","RWA","LBR","LBY","SSD","TCD","MLI","SEN","MOZ","CIV","COG","CMR","NER","TGO","GIN","ZWE","DJI","ERI","MDG","GHA","MRT","GNB","NAM","TZA","ZMB","MAR","COM","LSO","SWZ","TUN","BWA"];

function elPost(events){
  var def1 = deferred(), stmts=[];
  for(var i=0;i<events.length;i++){
    stmts.push({ index:  { _index: 'cr', _type: 'cr_country_year' } });
    stmts.push(events[i]);
  }
  client.bulk({
    body: stmts
  }, function (error, response) {
      def1.resolve();
  });
  return def1.promise;
}

var createEvent = function(header,row){
    var toAdd = [], ccd, c_name;
    if(countryCodes.indexOf(row[1])>-1){
      ccd = row[1];
      c_name = row[0];
      for(var i=2;i<header.length;i++){
        if(row[i]){
          var obj = {};
          obj["value"] = parseFloat(row[i]);
          obj["ccode"] = ccd;
          obj["c_name"] = c_name;
          obj["yr"] = parseInt(header[i]);
          toAdd.push(obj);
        }
      }
      return toAdd;
    }else{
      return undefined;
    }
};

var parser = csv.parse({delimiter: ','}, function(err, data ){
  var toPost = [];
  for(var i=1;i<data.length;i++){
    var arr = createEvent(data[0],data[i]);
    if(arr){
      toPost = toPost.concat(arr);  
    }
  }
  console.log("posting - " + toPost.length);
  var promise = elPost(toPost);
  promise.done(function(){
    console.log("posted");
  });
});

fs.createReadStream('gr_cleaned.csv').pipe(parser);

