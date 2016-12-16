var fs = require('fs');
var csv = require('csv');
var deferred = require('deferred');
var data,headers, rows, ctAtOnce = 10000;

var elasticsearch = require('elasticsearch');
//http://search-undp-uhzzk2e4xmpuedy3ys6war7364.us-east-1.es.amazonaws.com/
var client = new elasticsearch.Client({
  host: 'http://search-undp-uhzzk2e4xmpuedy3ys6war7364.us-east-1.es.amazonaws.com/'
});


var countryCodes = {
        "Algeria" : "DZA",
        "Somalia" : "SOM",
        "South Africa" : "ZAF",
        "DR Congo (Zaire)" : "COD",
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
        "Ivory Coast" : "CIV",
        "Congo" : "COG",
        "Cameroon" : "CMR",
        "Niger" : "NER",
        "Togo" : "TGO",
        "Guinea" : "GIN",
        "Zimbabwe (Rhodesia)" : "ZWE",
        "Djibouti" : "DJI",
        "Eritrea" : "ERI",
        "Madagascar (Malagasy)" : "MDG",
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
        "Burkina Faso" : "BFA"
 };

var mapping = {

  "filter" : {
    "key" : "region",
    "value" : "Africa"
  },
  "fields" : 
    [
      {
        "o_key" : "year",
        "n_key" : "year",
        "type" :    "integer"
      },
      {
        "o_key" : "active_year",
        "n_key" : "is_active_conflict",
        "type" :    "integer"
      },
      {
        "o_key" :  "type_of_violence",
        "n_key" : "type_of_conflict",
        "type" :    "integer"
      },
      {
        "o_key" :  "dyad_new_id",
        "n_key" : "d_id"
      },
      {

        "o_key" :  "dyad_name",
        "n_key" : "d_name"
      },
      {
        "o_key" :  "side_a"
      },
      {
        "o_key" :  "side_a_new_id",
        "n_key" : "side_a_id"
      },
      {
        "o_key" :  "side_b"
      },
      {
        "o_key" :  "side_b_new_id",
        "n_key" : "side_b_id"
      },
      {
        "o_key" :  "source_article"
      },
      {
        "o_key" :  "latitude",
        "type" :   "float"
      },
      {
        "o_key" :  "longitude",
        "type" :   "float"
      },
      {
        "o_key" :  "country"
      },
      {
        "o_key" :  "event_clarity",
        "n_key" : "clarity",
        "type" :    "integer"
      },
      {
        "o_key" :  "date_start"
      },
      {
        "o_key" :  "date_end"
      },
      {

        "o_key" :  "best_est",
        "type" :    "integer"
      },
      {
        "o_key" :  "high_est",
        "type" :    "integer"
      },
      {
        "o_key" :  "low_est",
        "type" :    "integer"
      }
    ]
};



function elPost(events){
  var def1 = deferred(), stmts=[];
  for(var i=0;i<events.length;i++){
    stmts.push({ index:  { _index: 'ucdp', _type: 'event' } });
    stmts.push(events[i]);
  }
  client.bulk({
    body: stmts
  }, function (error, response) {
      def1.resolve();
  });
  return def1.promise;
}

var createEvent = function(ct){
  var events = [], obj = {};
  var max = (ct+ctAtOnce) > rows ? rows : (ct+ctAtOnce);
  if(max>rows){
    return;
  }
  for(var c=ct;c<max;c++){
     obj = {};
     var fields = mapping.fields;
     var posFilter = headers.indexOf(mapping.filter.key);
     if(data[c][posFilter] == mapping.filter.value){
       for(var i=0;i<fields.length;i++){
          var field = fields[i];
          var pos = headers.indexOf(field.o_key);

          var val = data[c][pos];
          if(field.type == "integer"){
            val = val ? parseInt(val) : 0;
          }
          else if(field.type == "float"){
            val = val ? parseFloat(val) : 0;
          }
          else{
            val = val || "-";
          }
          

          obj[field.n_key ||field.o_key] = val;
          if(field.o_key == "country"){
             if(countryCodes[val]){
                obj["ccd"] = countryCodes[val]; 
             }else{
                console.log(val);
             }
             
          }
       }  
      events.push(obj);
    }
  }
  console.log("posting --" + events.length );
  var promise = elPost(events);
  promise.done(function(){
    console.log("posted");
    if(max < rows ){
      createEvent(ct+ctAtOnce)
    }
  });
};

var parser = csv.parse({delimiter: ','}, function(err, d ){
  data = d;
  headers = data[0];
  
  rows = data.length;
  //randomComparison();
  createEvent(1);
    //fs.writeFileSync("data.json",JSON.stringify(yrWiseJson));
});

fs.createReadStream('data/ged50-csv/ged50.csv').pipe(parser);
