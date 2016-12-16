var  SSAConflict = (function(){
  var w = window.innerWidth*.59, h = window.innerHeight, svg;
  var yr1 = 1989, yr2=2015;
  

  var drawMap = function(){
      var myCustomStyle = {
            stroke: false,
            fill: true,
            fillColor: '#ccc',
            fillOpacity: 1
        }
      var map = L.map('mapp',{
          center : [10.4530702,20.035771],
          zoom : 3,
          dragging : false,
          touchZoom  : false,
          scrollWheelZoom : false,
          doubleClickZoom : false,
          boxZoom : false,
          zoomControl : false,
          attributionControl : false
      });
      L.geoJson(africa, {
          clickable: false,
          style: myCustomStyle
      }).addTo(map);    
  }

  var runQ = function(q,c){
    $.ajax({
      type: "POST",
      url: "http://localhost:9200/ucdp/event/_search",
      data: JSON.stringify(q),
      success: function(data){
        c(data);
      },
      dataType: "json"
    });
  };

  var drawMiniMap = function(data,seq){
    var maxCountries = seq.length, maxInt=0, marginLeft = 20, marginRight=40, marginTop=40;
    var minimap = svg.append("g");
    //Finding the maximum intensity
    for(var i=0;i<data.length;i++){
      var countries = data[i].country.buckets;
      for(var k=0;k<countries.length;k++){
        if(countries[k].sum_f.value>maxInt){
          maxInt = countries[k].sum_f.value;
        }
      }
    }      

    //The actual minimap
    var wc = (w-marginLeft-marginRight)/data.length, hc = (200-marginTop)/maxCountries;
    for(var i=0;i<data.length;i++){
      var yr = data[i].key;
      var countries = data[i].country.buckets;
      for(var k=0;k<countries.length;k++){
         var country = countries[k].key;
         var pos = seq.indexOf(country);
         minimap.append("rect")
             .attr("x", marginLeft + wc*i)
             .attr("y", marginTop + hc*pos)
             .attr("width", wc)
            .attr("height", hc)
            .style("fill",getColor2(countries[k].sum_f.value,maxInt));
      }
    }
    
  }


  function getColor2(value, maxInt){
    if(value < 1000){
        // return "rgba(255,241,118,"+(value/1000)+")";
        return "rgb(255,241,118)";
      }else if(value> 1000 & value <= 5000){
        // return "rgba(255,183,77,"+(value/10000)+")";
        return "rgb(255,183,77)";
      }else if(value > 5000 && value <= 25000){
        // return "rgba(229,115,115,"+(value/50000)+")";
        return "rgb(229,115,115)";
      }else if(value > 25000 && value <= 100000){
        // return "rgba(244,67,54,"+(value/100000)+")";
        return "rgb(244,67,54)";
      }else if(value > 100000){
        // return "rgba(183,28,28,"+(value/maxInt)+")";
        return "rgb(183,28,28)";
      }
  }


  var drawLargeMap = function(data,country, countriesCt, yr1, yr2, ct){
    var countryD = svg.append("g");
    var marginTop = 250, marginLeft = 100, marginRight=40;
 
    var wi = w-marginLeft-marginRight, he = (800)/countriesCt;
    var domain = (yr2-yr1+1)*12;

    for(var i=0;i<data.length;i++){
        var event = data[i]._source;
        var date = new Date(event.date_start);
         var x = d3.scaleLinear()
                          .domain([1, domain])
                          .range([marginLeft, wi]);

         countryD.append("circle")
             .attr("cx", x((date-new Date(""+yr1))/(30*24*60*60*1000)))
             .attr("cy", marginTop + he*ct)
             .attr("r", he/10)
            .style("fill","#f9f9f9");
    }
    countryD.append("text")
         .attr("x", 20)
         .attr("y", marginTop + he*ct + he/2)
         .style("font-size", he/3 )
         .style("fill", "#f9f9f9")
         .text(country);
    countryD.append("line")
         .attr("x1", 20)
         .attr("x2", w-marginRight)
         .attr("y1", marginTop + he*ct + he)
         .attr("y2", marginTop + he*ct + he)
         .style("stroke", "#f9f9f9");
  }

  var drawDyads = function(data,dyadsCt,ct){
    var dyadD = svg.append("g");
    var marginTop = 150, marginLeft = 0, marginRight=40;
 
    var wi = w-marginLeft-marginRight, he = (h-marginTop - 10)/dyadsCt;
    var domain = (yr2-yr1+1)*12*30;
    var x = d3.scaleLinear()
              .domain([0, domain])
              .range([marginLeft, wi]);
    var y = marginTop + he*ct;
    dyadD.append("line")
             .attr("x1", x(0))
             .attr("x2", w-marginRight)
             .attr("y1", y)
             .attr("y2", y)
            .style("stroke","rgba(249, 249, 249, 0.4)");

    for(var i=0;i<data.length;i++){
        var event = data[i]._source;
        var date = new Date(event.date_start);
         

         dyadD.append("line")
             .attr("x1", marginLeft + wi *( ( (new Date(event.date_start)-new Date(""+yr1))/(24*60*60*1000) )/domain))
             .attr("x2", marginLeft + wi *( ( (new Date(event.date_end)-new Date(""+yr1))/(24*60*60*1000) )/domain))
             .attr("y1", y)
             .attr("y2", y)
            .style("stroke","#f9f9f9")
            .style("stroke-width",he/2);
    }

  }

  var getConflictsCountry = function(countries,ct, yr1, yr2){
    var country = countries[ct].key;
    var q = es_queries["default_country_yr_conflicts"];
    q["query"]["bool"]["must"][0]["range"]["year"]["gt"] = yr1;
    q["query"]["bool"]["must"][0]["range"]["year"]["lte"] = yr2;
    q["query"]["bool"]["must"][1]["term"]["country"]["value"] = country;

    //Once i have sequence I find per year the list of countries
    runQ(q,function(data){
      drawLargeMap(data.hits.hits,country,countries.length, yr1, yr2, ct );
      ct++;
      if(ct<countries.length){
        getConflictsCountry(countries,++ct,yr1,yr2)  
      }
    });

  };
  var getConflictsDyad = function(dyads,ct){
    var q = es_queries["dyad_conflicts"];
    console.log(ct);
    q["query"]["filtered"]["filter"]["term"]["d_id"] = dyads[ct].key;

    //Once i have sequence I find per year the list of countries
    runQ(q,function(data){
      drawDyads(data.hits.hits,dyads.length,ct );
      ct++;
      if(ct<dyads.length){
        getConflictsDyad(dyads,ct)  
      }
    });

  };

  return {

    drawGeoMap : function(){
      drawMap();
    },

    renderMiniMap : function(){

      //With this query I get the list of countries in order of most intense
      // conflicts over all the year
      runQ(es_queries["sequence_countries"],function(aggs){
        var countries = aggs.aggregations.countries.buckets, seq=[];
        for(var i=0;i<countries.length;i++){
          seq.push(countries[i].key);
        }
        //Once i have sequence I find per year the list of countries
        runQ(es_queries["default_conflicts_percountry_peryear"],function(data){
          drawMiniMap(data.aggregations["country-year"].buckets,seq);
        });
      })
    },
    renderLargeMap : function(yr1, yr2){
      //With this query I get the list of countries in order of most intense
      // conflicts over all the year
      var q = JSON.parse(JSON.stringify(es_queries["sequence_countries"]));
      if(yr1 || yr2){
        q["query"] = {"filtered": {"filter": {"range": {"year": {}}}}};
        if(yr1){
          q["query"]["filtered"]["filter"]["range"]["year"]["gte"] = yr1;
        }
        if(yr2){
          q["query"]["filtered"]["filter"]["range"]["year"]["lte"] = yr2; 
        }
      }
      runQ(q,function(aggs){
        var countries = aggs.aggregations.countries.buckets, seq=[];
        getConflictsCountry(countries,0,yr1,yr2);
      })
    },

    renderDyadConflicts : function(){
      //With this query I get the list of countries in order of most intense
      // conflicts over all the year
      var q = JSON.parse(JSON.stringify(es_queries["sequence_dyads"]));
      runQ(q,function(aggs){
        var dyads = aggs.aggregations.dyads.buckets, seq=[];
        getConflictsDyad(dyads,0);
      })
    },

    setup : function(){
      svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
    }

  }

})();

SSAConflict.setup();
//SSAConflict.renderMiniMap();
//SSAConflict.renderLargeMap(1991,1992);
SSAConflict.renderDyadConflicts();

SSAConflict.drawGeoMap();
