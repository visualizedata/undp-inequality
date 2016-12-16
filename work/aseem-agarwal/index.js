var najax = require('najax');
var fs = require('fs');

var DataLoad = (function(){

    var sendToES = function(url,items,ct){
      if(ct >= items.length){
        return;
      }
      loadURL({
        u:  "http://localhost:9200/ethnicity/groups",
        t : "POST",
        d : items[ct],
        c : function(msg){
              ct++;
              sendToES(url,items,ct);
          }
      });
    };

    var loadURL = function(params){
        var options = {
            url: params.u,
            data: params.d || null,
            type: params.t || "POST",
            contentType : params.contentType || "json"
        };
        najax(options).success(function(data){
            if(params.c){
                params.c(data);
            }
        }).error(function(data){
            console.log("ERROR - "+ data);
            /*fs.appendFile(fileName,  "\n ERROR -- "+data, function (err) {
              if (err) throw err;
            });
            */
        });
    };

    return {
      loadData : sendToES
    }
})();



var country_cont = JSON.parse(fs.readFileSync('/Users/aseemaggarwal/magichappens/newschool/courses/major-studio/major-studio-1/data/countries_continents.json'));

var cc = JSON.parse(fs.readFileSync('/Users/aseemaggarwal/magichappens/newschool/courses/major-studio/major-studio-1/data/country_codes.json'));
var cc_kv={};
for(var i=0;i<cc.length;i++){
  var fips = cc[i]["FIPS"];
  if(fips && fips.length){
    //console.log(fips);
    cc[i]["continent_code"] = country_cont["countries"][cc[i]["ISO3166-1-Alpha-2"]]["continent"];
    cc[i]["continent"] = country_cont["continents"][country_cont["countries"][cc[i]["ISO3166-1-Alpha-2"]]["continent"]];

    //console.log(cc[i]["continent"]);
    cc_kv[fips] = cc[i];
  }
}

//console.log(JSON.stringify(cc_kv));

var ethnic_grps = fs.readFileSync('/Users/aseemaggarwal/magichappens/newschool/courses/major-studio/major-studio-1/data/ethnic_grps.json');
var data = JSON.parse(ethnic_grps);

var only_grps = [];
var l = data.features.length;
for(var i=0;i<l;i++){
  var item = data.features[i].properties;
  var fips = item["FIPS_CNTRY"];
  if(cc_kv[fips]){
    item["continent"] = cc_kv[fips]["continent"];
    item["country_name"] = cc_kv[fips]["official_name_en"];
    item["continent_code"] = cc_kv[fips]["continent_code"];
    only_grps.push(data.features[i].properties);
    //console.log(JSON.stringify(item));
  }
}
DataLoad.loadData("http://localhost:9200/ethnicity/groups",only_grps,0);
