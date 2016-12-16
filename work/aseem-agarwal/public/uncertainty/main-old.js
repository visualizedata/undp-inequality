var mapObj;
var countryOfDyads = {} ;

var timePeriod = {
  "from" : 1989,
  "to" : 2014
};

var baseColor = "#eee";

var conflictTypes = [1,2,3];

var  SSAConflict = (function(){
  var w = window.innerWidth*.6, h = window.innerHeight*.7, svg, dyadsCont, timeline, indi;
  var yr1 = 1989, yr2=2015, lineTypes = ["0","2","8"], mainColor = "#00695c";
  
  var runQ = function(q,c,ind,type){
     var basesearchurl = "http://localhost:9200/";
    //var basesearchurl = "https://search-undp-nnvlmicmvsudjoqjuj574sqrty.us-west-2.es.amazonaws.com/";
    $.ajax({
      type: "POST",
      url: basesearchurl+(ind || "ucdp") + "/"+ (type || "event") + "/_search",
      data: JSON.stringify(q),
      success: function(data){
        c(data);
      },
      dataType: "json"
    });
  };

  //EVENT BL 

  var highlightDyad = function(id) {
    d3.selectAll("[activated='yes']")
      .style("stroke-width",0.3)
      .attr("activated","no");
    d3.selectAll(".dcc")
      .style("display","none");

    d3.selectAll(".dc_"+id)
      .style("stroke-width",2)
      .attr("activated","yes");
    d3.select("#dcc_"+id)
      .style("display","block");
  }



  var drawMap = function(){
      if(!mapObj){
        var myCustomStyle = {
              fill: true,
              fillColor: '#fff',
              fillOpacity: 0.1,
              color : "rgba(255,255,255,0.3)",
              "weight": 0.3
          }
        mapObj = L.map('mapp',{
            center : [10.4530702,20.035771],
            zoom : 3  ,
            minZoom : 3,
            dragging : true,
            touchZoom  : false,
            scrollWheelZoom : true,
            doubleClickZoom : true,
            boxZoom : false,
            zoomControl : false,
            attributionControl : false
        });
        L.geoJson(africa, {
            clickable: false,
            style: myCustomStyle
        }).addTo(mapObj);
      }
      drawConnections();    
      
  }

  var drawConnections = function(){
    //The line SVG Path we draw
    var marginTop=0, marginRight=40;
    var lines  = [], he = (h-10)/Object.keys(countryOfDyads).length;
    var svgg = d3.select(".leaflet-zoom-animated");
    var markers = svgg.append("g")
                      .attr("id","markers");

    for(var d in countryOfDyads){
      var positions = countryOfDyads[d].positions;
      var seq = countryOfDyads[d].seq;
      var max = positions.length > 75 ? 75 : positions.length;
      for(var i=0;i<max;i++){
        var latlong = mapObj.latLngToLayerPoint(positions[i]);
        var marker = L.circleMarker(positions[i],{
          radius : 1,
          color : baseColor,
          className : "event_point"
        });

        mapObj.addLayer(marker);
      }
      for(var i=0;i<1;i++){
        var latlong = mapObj.latLngToLayerPoint(positions[i]);
        var marker = L.circleMarker(positions[i],{
          radius : 8, 
          color : "#C23434",
          className : "event_point dc_"+d,
          d_id : d
        });
        marker.bindPopup(countryOfDyads[d].d_name + "<br>" + countryOfDyads[d].country);
        marker.on("click",function(){
          highlightDyad(this.options.d_id);
        });
        mapObj.addLayer(marker);
        lines = [];
        lines.push({
          "x" : latlong.x,
          "y" : latlong.y
        });
        var x = $("#mapp").width()- 10 - (seq+1)*5;
        // x = x > latlong.x ? latlong.x : x;
        lines.push({
          "x" : x,
          "y" : latlong.y
        });
         lines.push({
            "x" : x,
            "y" : marginTop + he*seq
        });
        lines.push({
            "x" : $("#mapp").width(),
            "y" : marginTop + he*seq
        });
        
        var type = countryOfDyads[d].type;
        var lineFunction = d3.line()
                              .curve(d3.curveBasis)
                              .x(function(d) { return d.x; })
                              .y(function(d) { return d.y; })
        /*                              
        var lineGraph = markers.append("path")
                                    .attr("d", lineFunction(lines))
                                  .attr("stroke", baseColor)
                                  .attr("fill", "none")
                                  .style("stroke-dasharray",lineTypes[type-1])
                                  .style("stroke-width",0.6)
                                  .attr("class","dc_"+d)
        */
      }
    }
  }


 


  var drawDyads = function(data,dyadsCt,ct){
    var dyadD = dyadsCont.append("g")
                   .attr("name", data[0]._source.d_name)
                   .attr("class","dyad")
                   .attr("id", "d_"+data[0]._source.d_id)
                   .attr("country", data[0]._source.country) 
    var marginTop = 40, marginLeft = 20, marginRight=0.03*window.innerWidth;
 
    var wi = w-marginLeft-marginRight, he = (h-marginTop - 10)/dyadsCt;


    he = he > 30 ? 30 : (he < 15 ? 15 : he );

    var domain = (yr2-yr1+1)*365*24*60*60*1000;
    var x = d3.scaleLinear()
              .domain([0, domain])
              .range([marginLeft, wi]);
    var y = marginTop + (he+1)*ct;
    var type = data[0]._source.type_of_conflict;
    
    dyadD.append("circle")
             .attr("cx", 7)
             .attr("cy", y)
             .attr("r", 5)
            .style("stroke",baseColor)
            .style("fill","none")
            .attr("class","dcc")
            .attr("id","dcc_"+data[0]._source.d_id)
            .style("stroke-width",2)
            .style("display","none");

    dyadD.append("line")
             .attr("x1", x(0))
             .attr("x2", w-marginRight)
             .attr("y1", y)
             .attr("y2", y)
             .style("stroke-dasharray",lineTypes[type-1])
            .style("stroke",baseColor)
            .attr("class","dc_"+data[0]._source.d_id)
            .style("stroke-width",0.3);



    for(var i=0;i<data.length;i++){
        var event = data[i]._source;
        var date = new Date(event.date_start);

        //Just assuming here, all the events of dyads happen in same country
        countryOfDyads[event.d_id] = countryOfDyads[event.d_id] || {"positions" : []};
        countryOfDyads[event.d_id]["type"] = event.type_of_conflict;
        countryOfDyads[event.d_id]["seq"] = ct;
        countryOfDyads[event.d_id]["positions"].push([event.latitude,event.longitude]);
        countryOfDyads[event.d_id]["country"] = (event.country);
        countryOfDyads[event.d_id]["d_name"] = (event.d_name);
        countryOfDyads[event.d_id]["conflicts"] = data.length;

        // .attr("x1", marginLeft + wi *( ( (new Date(event.date_start)-new Date(""+yr1))/(24*60*60*1000) )/domain))
        // .attr("x2", marginLeft + wi *( ( (new Date(event.date_end)-new Date(""+yr1))/(24*60*60*1000) )/domain))
        var x1 = x(new Date(event.date_start)-new Date(""+yr1));
        var x2 = x(new Date(event.date_end)-new Date(""+yr1));
          if(x2-x1 < 1){
            x2 = x1+1;
          }
         var height = (event.best_est/5000)*he;
         dyadD.append("rect")
            .attr("x", x1)
            .attr("y", x2)
            .attr("y1", y)
            .attr("y2", y)
            .style("stroke",getColor2(event.best_est))
            .style("stroke-width",he/3)
            .attr("deaths", event.best_est)
            .attr("duration",event.date_start + "--" + event.date_end)
            .attr("id", data[i]._id);
    }


  }
  function getColor2(value){
    if(value <= 10){
        // return "rgba(255,241,118,"+(value/1000)+")";
        return "rgba(255,241,118,0.5)";
      }else if(value> 10 & value <= 500){
        // return "rgba(255,183,77,"+(value/10000)+",0.7)";
        return "rgba(255,183,77,0.6)";
      }else if(value > 500 && value <= 5000){
        // return "rgba(229,115,115,"+(value/50000)+",0.7)";
        return "rgba(229,115,115,0.7)";
      }else if(value > 5000 && value <= 20000){
        // return "rgba(244,67,54,"+(value/100000)+",0.7)";
        return "rgba(244,67,54,0.8)";
      }else if(value > 20000){
        // return "rgba(183,28,28,"+(value/maxInt)+",0.7)";
        return "rgba(183,28,28,0.9)";
      }
  }

  function colorKeys(){
    var marginRight=0.03*window.innerWidth;
    dyadsCont.append("rect")
         .attr("x",220)
         .attr("y",15)
         .attr("width",42)
         .attr("height",5)
         .style("fill",getColor2(20001));
    dyadsCont.append("text")
         .attr("x",220)
         .attr("y",9)
         .attr("font-size","10px")
         .style("fill",baseColor)
         .text("> 20k");

    dyadsCont.append("rect")
         .attr("x",170)
         .attr("y",15)
         .attr("width",42)
         .attr("height",5)
         .style("fill",getColor2(5001));
    dyadsCont.append("text")
         .attr("x",170)
         .attr("y",9)
         .attr("font-size","10px")
         .style("fill",baseColor)
         .text("5k-20k");

     dyadsCont.append("rect")
         .attr("x",120)
         .attr("y",15)
         .attr("width",42)
         .attr("height",5)
         .style("fill",getColor2(501));
    dyadsCont.append("text")
         .attr("x",120)
         .attr("y",9)
         .attr("font-size","10px")
         .style("fill",baseColor)
         .text("500-5k");

    dyadsCont.append("rect")
         .attr("x",70)
         .attr("y",15)
         .attr("width",42)
         .attr("height",5)
         .style("fill",getColor2(11));
     dyadsCont.append("text")
         .attr("x",70)
         .attr("y",9)
         .attr("font-size","10px")
         .style("fill",baseColor)
         .text("10-500");

      dyadsCont.append("rect")
         .attr("x",20)
         .attr("y",15)
         .attr("width",42)
         .attr("height",5)
         .style("fill",getColor2(5));
      dyadsCont.append("text")
         .attr("x",20)
         .attr("y",9)
         .attr("font-size","10px")
         .style("fill",baseColor)
         .text("<10");
  }


  var getConflictsDyad = function(dyads,ct,callback){
    var def = $.Deferred();
    var q = es_queries["dyad_conflicts"];
    q["query"]["filtered"]["filter"]["term"]["d_id"] = dyads[ct].key;

    colorKeys();
    //Once i have sequence I find per year the list of countries
    runQ(q,function(data){
      var dyadData = data.hits.hits;
      
      drawDyads(dyadData,dyads.length,ct );
      ct++;
      if(ct<dyads.length){
        getConflictsDyad(dyads,ct,callback)  
      }else{
        $(".dyad").on("click",function(){
            var id = $(this).attr("id").replace("d_","");
            highlightDyad(id);
        });
        callback();
      }
    });
  };


  var drawTimeline = function(){

      var marginTop =20, marginRight=window.innerWidth*0.015, timeInterval = 5, marginLeft=40;

      var yrInterval = parseInt((timePeriod.to  - timePeriod.from)/timeInterval);

      var yrStart = timePeriod.from;

      var x = d3.scaleLinear()
              .domain([timePeriod.from, timePeriod.to])
              .range([marginLeft, w-marginRight-marginLeft]);

      while(true){
        timeline.append("text")
            .attr("x", x(yrStart))
            .attr("y",marginTop)
            .attr("text-anchor","middle")
            .attr("alignment-baseline","central")
            .style("fill",baseColor)
            .style("font-size","20px")
            .text(yrStart);
        if(yrStart == timePeriod.to){
          break;
        }
        else if(yrStart + yrInterval> timePeriod.to){
          yrStart = timePeriod;
        }else{
          yrStart += yrInterval;
        }
      }
      /*
      timeline.append("circle")
              .attr("cx",w-marginRight/2)
              .attr("cy",marginTop)
              .attr("r",10)
              .style("fill","none")
              .style("stroke-width","2px")
              .style("stroke","#eeeeee")
      timeline.append("text")
              .attr("x",w-marginRight/3)
              .attr("y",marginTop+5)
              .style("fill","#eeeeee")
              .text("+");
      */
     
  };

  /**
  Not using it now; as of now
 
  var drawTimeSlider = function(callback){
    var slider = svg.append("g")
       .attr("id","slider");
    var marginTop = 180, marginRight=40;
    var sliderEndpointRadius = 5;

    var textHeight = 25;
    var textWidth = 30;

    // slider.append("line")
    //       .attr("x1", 0 )
    //       .attr("y1", marginTop+textHeight)
    //       .attr("x2", w - 40 )
    //       .attr("y2", marginTop+textHeight)
    //       .attr("stroke",baseColor);
    
    //From
    var from = slider.append("g")
          .attr("class","from");

    from.append("text")
            .attr("x",0)
            .attr("y",marginTop)
            .attr("class","from dec control")
            .attr("text-anchor","middle")
            .attr("alignment-baseline","central")
            .style("fill",baseColor)
            .style("cursor","pointer")
            .style("line-height",textHeight)
            .text("--");
    from.append("text")
            .attr("x", textWidth)
            .attr("y",marginTop)
            .attr("class","from value")
            .attr("text-anchor","middle")
            .attr("alignment-baseline","central")
            .style("fill",baseColor)
            .style("line-height",textHeight)
            .text("1989");
    from.append("text")
            .attr("x",textWidth*2)
            .attr("y",marginTop)
            .attr("class","from inc control")
            .attr("text-anchor","middle")
            .attr("alignment-baseline","central")
            .style("fill",baseColor)
            .style("line-height",textHeight)
            .style("cursor","pointer")
            .text("+");

    from.append("circle")
          .attr("cx", sliderEndpointRadius +2 )
          .attr("cy", marginTop+textHeight)
          .attr("r",sliderEndpointRadius)
          .style("fill",mainColor)
          .style("stroke",baseColor)
          .style("stroke-width",2)
          .attr("type","from")
          .attr("id","c1");

    //From
    var to = slider.append("g")
          .attr("class","to");

    // to.append("rect")
    //         .attr("rx", 2)
    //         .attr("ry", 2)
    //         .attr("x",0)
    //         .attr("y",marginTop)
    //         .attr("width",textHeight)
    //         .attr("height",textHeight)
    //         .attr("class","dec cont")
    //         .style("fill",baseColor)

    var leftPos = w - marginRight - textWidth*2;
    // to.append("text")
    //         .attr("x",leftPos)
    //         .attr("y",marginTop)
    //         .attr("class","to dec control")
    //         .attr("text-anchor","middle")
    //         .attr("alignment-baseline","central")
    //         .style("fill",baseColor)
    //         .style("cursor","pointer")
    //         .style("line-height",textHeight)
    //         .text("--");
    to.append("text")
            .attr("x", leftPos + textWidth)
            .attr("y",marginTop)
            .attr("text-anchor","middle")
            .attr("alignment-baseline","central")
            .attr("class","to value")
            .style("fill",baseColor)
            .style("line-height",textHeight)
            .text("2014");
    // to.append("text")
    //         .attr("x",leftPos + textWidth*2)
    //         .attr("y",marginTop)
    //         .attr("class","to inc control")
    //         .attr("text-anchor","middle")
    //         .attr("alignment-baseline","central")
    //         .style("fill",baseColor)
    //         .style("line-height",textHeight)
    //         .style("cursor","pointer")
    //         .text("+");

    // to.append("circle")
    //       .attr("cx", leftPos + textWidth*2 - sliderEndpointRadius )
    //       .attr("cy", marginTop+textHeight)
    //       .attr("r",sliderEndpointRadius)
    //       .style("fill",baseColor)
    //       .attr("type","from")
    //       .attr("id","c2");

   // var initTimer;
   // slider.selectAll(".control").on("click",function(){
   //   var yr1,yr2;
   //   var classes = d3.select(this).attr("class");
   //   if(classes.indexOf("to")>-1){
   //    var value = parseInt(d3.select(".to.value").text());
   //    if(classes.indexOf("inc")>-1){
   //        value++;
   //    }else{
   //        value--;
   //    }
   //    yr2 = value;
   //    d3.select(".to.value").text(yr2);
   //   }else{
   //    var value = d3.select(".from.value").text();
   //    if(classes.indexOf("inc")>-1){
   //        value++;
   //    }else{
   //        value--;
   //    }
   //    yr1 = value;
   //    d3.select(".from.value").text(yr1);
   //   }
   //   if(initTimer){
   //      clearTimeout(initTimer);
   //   }
   //   initTimer = setTimeout(function(){
   //      callback(yr1,yr2);
   //   },2000);
   // })
      
  };
   **/

  var unempIndicator = function(dataUnem,color,stroke, markers){
    
    var maxUnem = 0, minUnem = 100000000;

    for(var i=0;i<dataUnem.length;i++){
      if(dataUnem[i].sum_v.value > maxUnem){
        maxUnem = dataUnem[i].sum_v.value;
      }
      if(dataUnem[i].sum_v.value < minUnem){
        minUnem = dataUnem[i].sum_v.value;
      }
    }
    var lines = [];
    var x = d3.scaleLinear()
              .domain([1989, 2014])
              .range([0, w-40]);
    var y = d3.scaleLinear()
              .domain([minUnem, maxUnem])
              .range([0, window.innerHeight*.15]);
    
    for(var i=0;i<dataUnem.length;i++){
      var xp = x(dataUnem[i].key);
      var yp =  y(dataUnem[i].sum_v.value);
      lines.push({
          "x" : xp,
          "y" : yp
      });
      if(markers){
        // indi.append("circle")
        //     .attr("cx", xp)
        //     .attr("cy", yp)
        //     .attr("r", window.innerHeight*.01)
        //     .style("fill","none")
        //     .style("stroke-width",2)
        //     .style("stroke",baseColor);
      }
    }

    var lineFunction = d3.line()
                          .curve(d3.curveBasis)
                          .x(function(d) { return d.x; })
                          .y(function(d) { return d.y; })

    var lineGraph = indi.append("path")
                              .attr("d", lineFunction(lines))
                              .attr("stroke", color )
                              .attr("fill", "none")
                              .style("stroke-width",stroke);
  };

  var filterEvents = function(){
     $(".filters .types .type").on("click",function(event){
        var type = $(this);
        var typeVal = parseInt($(".label",type).data("type"));
        if(type.hasClass("active")){
          type.removeClass("active");
          conflictTypes.splice(conflictTypes.indexOf(typeVal),1);
        }else{
          type.addClass("active");
          conflictTypes.push(typeVal);
        }
        $(".filters .update").removeClass('disabled');
     });

     $(".filters .update").on("click",function(){
        if(!$(this).hasClass("disabled")){
          SSAConflict.clear();
          SSAConflict.init();  
          $(this).addClass("disabled");
        }
     });

     $(".filter").on("click",function(){
        $(this).find(".hidden").toggle();
     });
     $(".filter .hidden .label").on("click",function(){   
         var el = $(this);
         if(!el.hasClass("active")){
            $(".filter .hidden .label.active").removeClass("active");
            el.addClass("active");
            el.parent().parent().find(".selected").text(el.data("text"));
         }
         el.parent().find(".hidden").hide();
     });  

     /*
     $(".filters .years .year").on("click",function(event){
        var type = $(this);
        var yrNew = parseInt($(".label",type).text());


        var yr2 = parseInt($(".years .year .active").parent().find(".label")[0].innerHTML);
        var yr1 = parseInt($(".years .year .active").parent().find(".label")[1].innerHTML);

        SSAConflict.clear();
        if($("." + yrNew).next().find(".selection").hasClass("active")){
          $("." + yrNew).next().find(".selection").removeClass("active")
        }else if($("." + yrNew).next().find(".selection").hasClass("active")){
          $("." + yrNew).next().find(".selection").removeClass("active")
        }
        debugger;

     });
     */

  };

  return {

    filterEvents : function(){
      filterEvents();
    },

    drawGeoMap : function(){
      drawMap();
    },
    renderDyadConflicts : function(doneCallback){
      //With this query I get the list of countries in order of most intense
      // conflicts over all the year
      var q = JSON.parse(JSON.stringify(es_queries["sequence_dyads"]));
      q["query"]["bool"]["must"][0]["range"]["year"]["gte"] = timePeriod.from;
      q["query"]["bool"]["must"][0]["range"]["year"]["lte"] = timePeriod.to;
      q["query"]["bool"]["must"][1]["terms"]["type_of_conflict"] = conflictTypes;

      runQ(q,function(aggs){
        var dyads = aggs.aggregations.dyads.buckets, seq=[];
        countryOfDyads = {};
        getConflictsDyad(dyads,0,function(){
          doneCallback();
        });
      })
    },


    drawTimeline : function(){
      drawTimeline();
    },
    setup : function(width){
      var ww = width || w;
      dyadsCont = d3.select("#dyads")
                    .append("svg")
                    .attr("width", ww)
                    .attr("height", window.innerHeight*.7)
                    .attr("id","dyadsCont");
      // dyadsCont = svg.append("g").attr("id","dyadsCont");

      timeline = d3.select(".timeline .container").append("svg")
                       .attr("id","timeline")
                       .attr("width", ww)
                       .attr("height", window.innerHeight*.07);

      indi = d3.select(".indicator").append("svg")
                       .attr("id","indicator")
                       .attr("width", ww)
                       .attr("height", window.innerHeight*.19);
    },
    clear : function(){
        $("#dyadsCont").empty();
        $("#timeline").empty();
        $("#indicator").empty();
        $("#mapp #markers").empty();
        $("#mapp .event_point").remove();
    },
    resize : function(wi){
      w = wi;
      dyadsCont.attr("width",wi);
      timeline.attr("width",wi);
      indi.attr("width",wi);
    },
    init : function(yr1,yr2){
        SSAConflict.renderDyadConflicts(function(){
          SSAConflict.drawTimeline();
          SSAConflict.drawGeoMap();
          SSAConflict.renderIndicators();
        });
    },

    renderIndicators : function(){
        var q = es_queries["unemployment_data"];
        runQ(q,function(data){
            unempIndicator(data.aggregations.by_year.buckets,"#aaa",1);
            var countries = [];
            for(var d in countryOfDyads){
              if(countries.indexOf(countryOfDyads[d].country)==-1){
                 countries.push(countryOfDyads[d].country);
              }
            } 
            console.log(countries);
            q = es_queries["unemployment_data_filtered"];
            q["query"]["bool"]["must"][0]["terms"]["country"] = countries;
            runQ(q,function(data){
                unempIndicator(data.aggregations.by_year.buckets, "#fff",2, true);
            },"unemp","c_unemp");
        },"unemp","c_unemp");
    }

  }

})();


SSAConflict.setup();
SSAConflict.init();



SSAConflict.filterEvents();

