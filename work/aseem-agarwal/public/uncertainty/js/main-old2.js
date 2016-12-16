var mapObj;
var countryOfDyads = {} ;

var timePeriod = {
  "from" : 1989,
  "to" : 2014
};

var outlierColor = "#000000";
var bgColor = "#f9f9f9"
var baseColor = "#4A4A4A";
var baseColorLight = "#bbbbbb";
var highlightColor = "#616161";
var secondHighlightColor = "#006e98";
var healthColor = "#4c9f38";

var helpText = {
  "cr" : "Total enrollment in primary education, regardless of age, expressed as a percentage of the population of official primary education age.<br> ",
  "unemp" : "Unemployment, total (% of total labor force) (modeled ILO estimate)",
  "ct1" : "Fighting either between two states, or between a state and a rebel group that challenges it",
  "ct2" : "Conflicts in which none of the warring parties is a state",
  "ct3" : "The use of armed force by the government of a state or by a formally organized group against civilians which results in at least 25 deaths in a year",
  "i1" : "Conflict here specifically means use of violence during a disagreement between two groups either of which can be government or not. Each conflict is color coded to display the intensity in terms of deaths or fatalities that resulted in that conflict.<br> <br> Fatalities Scale <span class='scale' style='color:#F3BE8A;'>< 10</span><span class='scale' style='color:#E2825F;'>10-100</span><span class='scale' style='color:#C71F17;'>100-500</span><span class='scale' style='color:#8A0D0A;'>500-5000</span><span class='scale' style='color:#8A0D0A;'>>5000(spike)</span>",
  "conflicts" : "What you see here is number of conflicts in a single year. That is what the height of the bar denotes. The color shows the intensity in terms of the fatalities that resulted."
}

var conflictTypes = [1,2,3], indicator = "Primary Enrollment", changed, countrySelected = ["Rwanda","RWA"];

var  SSAConflict = (function(){
  var w = window.innerWidth*.57, h = window.innerHeight*.7, svg, dyadsCont, timeline, indi, countryDyadsCont, conflictCountries;
  var lineTypes = ["0","2","8"], mainColor = "#00695c";
  
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

  var highlighCountry = function(cname,c){
      cname  = cname || countrySelected[0];
      c = c || countrySelected[1];
      countrySelected[0] = cname;
      countrySelected[1] = c;
      SSAConflict.clear();
      SSAConflict.init();  
      $(".user_selection").empty().append("<div class='country label'>"+cname+"</div>");
      d3.selectAll(".countryGeo")
      	.style("stroke-width",0.8)
      	.style("stroke",baseColorLight);

      d3.select(".country_"+c)
      	.style("stroke-width",4)
      	.style("stroke",baseColor);
  };



  //EVENT BL 

  var highlightDyad = function(id) {
    var dy = countryOfDyads[id];
    $(".user_selection").html(dy.d_name + "(" +dy.country+ ")" + "<br>" + dy.conflicts +" conflict events" + "<br>" + dy.fatalities +" fatalities");

    var h =  $("#d_"+id).parent().parent().height();
    var pos = $("#d_"+id).position().top;
    if(pos > h){
      $("#dyads").animate({ scrollTop: (pos-h)+"px" });
    }else{
      $("#dyads").animate({ scrollTop: 0 });
    }
    d3.selectAll("[activated='yes']")
      .style("stroke-width",0.3)
      .style("stroke",baseColor)
      .attr("activated","no");
    d3.selectAll(".dcc")
      .style("display","none");

    d3.selectAll(".dc_"+id)
      .style("stroke-width",1)
      .style("stroke",highlightColor)
      .attr("activated","yes");
    d3.select("#dcc_"+id)
      .style("display","block");
    d3.selectAll(".ep_"+id)
      .style("stroke",highlightColor);
  }

  //This is where the skeleton is drawn with the conflict intensity.
  var drawMapSkeleton = function(){
    runQ(es_queries["conflict_country"],function(data){
      var co_in_ob = {}, data = data.aggregations.country_inq.buckets;
      //If I keep it 100000, only two countries are above it. 
      var max=100000;
      for(var i=0;i<data.length;i++){ 
        co_in_ob[data[i]["key"]] = data[i]["sum"]["value"];
      }
      if(!mapObj){
        var myCustomStyle = {
              fill: true,
              fillColor: highlightColor,
              fillOpacity: 0.2,
              color : baseColorLight,
              weight: 1
          }
        //This is just stupid.
        var zoomLevel = 3.1 + parseInt((window.innerHeight-700)/400)*.5;
        mapObj = L.map('mapp',{
            center : [10.4530702,20.035771],
            zoom : zoomLevel,
            minZoom : zoomLevel,
            dragging : true,
            touchZoom  : false,
            scrollWheelZoom : true,
            doubleClickZoom : false,
            boxZoom : false,
            zoomControl : false,
            attributionControl : false
        });
      }
      L.geoJson(africa, {
          clickable: true,
          style: myCustomStyle,
          onEachFeature : function(d,l){
            var c = d.properties.iso_a3;
            var cname = d.properties.sovereignt;
              if(l.options)
              l.options.className = "countryGeo country_"+c;
              l.setStyle({
                fillOpacity: co_in_ob[c] ? parseInt(co_in_ob[c])/max : 0.1
              });
              l.on("click",function(){
                highlighCountry(cname,c);
              }); 
            
          }
      }).addTo(mapObj);
          
    },"ucdp","event");
  }

  var drawMapConnections = function(data){
    //The line SVG Path we draw
    var marginTop=0, marginRight=40;
    var svgg = d3.select(".leaflet-zoom-animated");
    var markers = svgg.append("g")
                      .attr("id","markers");

    for(var d in countryOfDyads){
      var events = countryOfDyads[d].events;
      var countryCode = countryOfDyads[d].ccd;
      var seq = countryOfDyads[d].seq;
      var max = events.length > 75 ? 75 : events.length;
      var smallCircleRadius = window.innerHeight*0.002;
      for(var i=0;i<max;i++){
        var latlong = mapObj.latLngToLayerPoint(events[i].position);
        var marker = L.circleMarker(events[i].position,{
          radius : 0.6,
          color : getColor2(events[i].fatalities),
          className : "eventPoint epc_"+countryCode + " epd_"+d,
          toColor : getColor2(events[i].fatalities)
        });

        mapObj.addLayer(marker);
      }
      var bigCircleRadius = window.innerHeight*0.007;
      for(var i=0;i<1;i++){
        var latlong = mapObj.latLngToLayerPoint(events[i].position);
        var marker = L.circleMarker(events[i].position,{
          radius : 4, 
          color : baseColor,
          className : "eventHomeCountry ehcc_"+countryCode + " ehcd_"+d,
          d_id : d
        });
        marker.bindPopup(countryOfDyads[d].d_name + "<br>" + countryOfDyads[d].country);
        mapObj.addLayer(marker);
      }
    }
  }


 


  var recordDyad = function(data,eventTimeline){
    for(var i=0;i<data.length;i++){
        var event = data[i]._source;
        //Just assuming here, all the events of dyads happen in same country
        countryOfDyads[event.d_id] = countryOfDyads[event.d_id] || {"events" : []};
        countryOfDyads[event.d_id]["type"] = event.type_of_conflict;
        countryOfDyads[event.d_id]["events"].push({
          "position" : [event.latitude,event.longitude],
          "date_end" : event.date_end,
          "fatalities" : event.high_est
        });
        countryOfDyads[event.d_id]["timeline"] = eventTimeline;
        countryOfDyads[event.d_id]["country"] = (event.country);
        countryOfDyads[event.d_id]["ccd"] = (event.ccd);
        countryOfDyads[event.d_id]["d_name"] = (event.d_name);
        countryOfDyads[event.d_id]["conflicts"] = data.length;
        countryOfDyads[event.d_id]["fatalities"] = (countryOfDyads[event.d_id]["fatalities"] || 0) + event.high_est;
    }
    
  }
  function getHeight(value,he){
    if(value <= 10){
      return he;
    }
    else if(value > 10 && value <= 100){
      return he;
    }
    else if(value > 100 && value <= 500){
      return he;
    }
    else if(value > 500 && value <= 5000){
      return he;
    }
    else if(value>5000){
      return he*5;
    }
  }

  function getColor2(value){
    if(!value){
      return baseColor;
    }
    else if(value <= 10){
      return "#F3BE8A";
    }
    else if(value > 10 && value <= 100){
      return "#E2825F";
    }
    else if(value > 100 && value <= 500){
      return "#C71F17";
    }
    else if(value > 500 && value <= 5000){
      return "#8A0D0A";
    }
    else if(value>5000){
      return "#8A0D0A";
    }
    /*
    if(value <= 1000){
        return "rgba(239, 80, 80, 1)";
      }else if(value> 1000 & value < 5000){
         return "rgba(0, 0, 0,1)";
      }else if(value >= 5000){
        return "rgba(0, 0, 0,0.5)";
      }
    */
  }


  var getConflictsDyad = function(dyads,cct,ct,totalCt,callback){

    var countryGrp, q = es_queries["dyad_conflicts"];
    console.log(dyads[cct].key + "-" + ct);
    q["query"]["bool"]["must"][0]["term"]["d_id"]["value"] = dyads[cct]["dyads"]["buckets"][ct].key;
    q["query"]["bool"]["must"][1]["term"]["ccd"]["value"] = dyads[cct].key;

    //Once i have sequence I find per year the list of countries
    runQ(q,function(data){
      var dyadData = data.hits.hits;
      var eventTimeline = [];
      for(var i=0;i<(timePeriod.to-timePeriod.from)*365;i++){
        eventTimeline[i] = -1;
      }
      for(var i=0;i<dyadData.length;i++){
        var event = dyadData[i]._source;
        var days = new Date(event.date_end)-new Date(event.date_start);
        days = days ? days / (1000*60*60*24) : 1;
        var one_day_intensity = event.high_est/days;
        for(var z=0;z<days;z++){
          var pos = (new Date(event.date_start).getTime()-new Date(""+timePeriod.from))/(24*1000*60*60)+z;
          eventTimeline[pos] = eventTimeline[pos] == -1 ? 0 : eventTimeline[pos];
          eventTimeline[pos] += one_day_intensity;
        }
      }
      
      recordDyad(dyadData,eventTimeline);
      ct++;
      if(ct<dyads[cct]["dyads"]["buckets"].length){
        totalCt++;
        getConflictsDyad(dyads,cct,ct,totalCt,callback)  
      }else{
        cct++;
        if(cct<dyads.length){
          totalCt++;
          getConflictsDyad(dyads,cct,0,totalCt,callback)  
        }else{
          $(".dyad").on("click",function(){
              var id = $(this).attr("id").replace("d_","");
              highlightDyad(id);
          });
          callback();
        }
      }
      
    });
  };


  var drawTimeline = function(){
    var marginTop =20, marginRight=0, timeInterval = 5, marginLeft=20;

    var yrInterval = parseInt((timePeriod.to  - timePeriod.from)/timeInterval);

    var yrStart = timePeriod.from;

    var x = d3.scaleLinear()
            .domain([timePeriod.from, timePeriod.to+1])
            .range([marginLeft, w-marginRight-marginLeft]);

    while(true){
      timeline.append("text")
          .attr("x", x(yrStart))
          .attr("y",marginTop)
          .attr("text-anchor","middle")
          .attr("alignment-baseline","central")
          .style("fill",baseColor)
          .style("font-size",window.innerHeight*.03+"px")
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
  };

  var countryConflictTimeline = function(countryDyadsCont,d_name,d_id,type,eventTimeline,ct){

    var dyadD = countryDyadsCont.append("g")
                   .attr("name", d_name)
                   .attr("class","countryDyad dt_"+type)
                   .attr("id", "d_"+d_id)
                   .attr("ccd", countrySelected[1]);

    var marginLeft = 10, marginRight=0, marginTop=20;
 
    var wi = w-marginLeft-marginRight;
    var he = parseInt(window.innerHeight*.02);

    var domain = (timePeriod.to-timePeriod.from+1)*365*24*60*60*1000;
    var x = d3.scaleLinear()
              .domain([0, domain])
              .range([marginLeft, wi]);
    var y = marginTop + (he)*ct;
    
  
    dyadD.append("line")
             .attr("x1", x(0))
             .attr("x2", w-marginRight)
             .attr("y1", y)
             .attr("y2", y)
            .style("stroke",baseColor)
            .attr("id", "cdt_"+d_id)
            .attr("class","countryDyadType")
            .style("stroke-width",0.1);

    var daysToClub = Math.floor(((timePeriod.to-timePeriod.from+1)*365)/wi);
    var ctt = 0, value=0, covered=0, justCounting =0;
    while(ctt<eventTimeline.length){
        value = -1;
        for(var i=0;i<daysToClub;i++){
          value = value == -1 ? 0 : value;
          value += eventTimeline[ctt];
          ctt++;
        }
        if(value >=0 ){
          var x1 = marginLeft + covered;
          var x2 = x1+1;
          //var height = ((value > he ? he : value)/he)*he;
          var height = getHeight(value,he);
          dyadD.append("rect")
             .attr("x", x1)
             .attr("y", y-height)
             .attr("width", 1)
             .attr("height", height)
             .style("fill",getColor2(value))
             .attr("deaths", value);
        }
        covered++;
    }
  }

  var unempIndicator = function(type,dataUnem, color,classs,impactDomain,indi){
    var  marginRight=0,lines = [];

    var ht = parseInt(indi.attr("height"));
    
    // impactDomain = [0,1000000];
    // for(var i=0;i<dataUnem.length;i++){
    //   if(dataUnem[i].value>impactDomain[0]){
    //     impactDomain[0] = dataUnem[i].value;
    //   }
    //   if(dataUnem[i].value<impactDomain[1]){
    //     impactDomain[1] = dataUnem[i].value;
    //   }
    // }
    var x = d3.scaleLinear()
              .domain([timePeriod.from, timePeriod.to+1])
              .range([0, w-marginRight]);
    var y = d3.scaleLinear()
              .domain(impactDomain)
              .range([0, ht]);

    var indi_g = indi.append("g")
        .attr("class",classs)
        .attr("type",type);


    $(".keys .parameter .label").text(indicator);
    $(".keys .parameter .label").attr("data-help",type);
    
   
    var ct = 0, x1, x2, y1=y(impactDomain[1]), y2=y(impactDomain[1]), value, strokeColor;
    for(var i=timePeriod.from;i<=timePeriod.to;i++){
      x1 = x(i), value = 0, dashed=false;
      if(dataUnem[ct] && dataUnem[ct].key == i){
        y2 = y(dataUnem[ct].value);
        value = dataUnem[ct].value;
        strokeColor=color;
        if(y2<=0){
          y2 = 1;
          strokeColor = outlierColor;
          dashed = true;
        }
        if(y2>=ht){
          y2 = ht-1;
          strokeColor = outlierColor;
          dashed = true;
        }
        ct++;
      }else{
        strokeColor=bgColor;
      }
      if(i>timePeriod.from){

        indi_g.append("line")
            .attr("x1", x1)
            .attr("x2", x1)
            .attr("y1", y1)
            .attr("y2", y2)
            .attr("stroke", strokeColor)
            .attr("stroke-width",3)
            .attr("value",value)
      }
      
      if(i<(timePeriod.to+1)){
        x2 = x(i+1);
        indi_g.append("line")
              .attr("x1", x1)
              .attr("x2", x2)
              .attr("y1", y2)
              .attr("y2", y2)
              .style("stroke-dasharray", !dashed ? ("0") : ("2, 2"))
              .attr("stroke", strokeColor)
              .attr("stroke-width",3);
      }
      y1=y2;
    }
   
    //Adding the y axis labels here
    var impactInterval = parseInt((impactDomain[0]-impactDomain[1])/2);
    for(var i=0; i<=2;i++){
      var txtLable = indi_g.append('g')
      var val = parseInt(i*impactInterval+impactDomain[1]);
      txtLable.append("rect")
            .attr("x", 0)
            .attr("y", y(val)-10*(2-i))
            .attr("width",15)
            .attr("height",15)
            .attr("fill",bgColor);
      txtLable.append('foreignObject')
                        .attr('x', 0)
                        .attr('y', y(val)-7.5*(2-i))
                        .attr('width', 15)
                        .attr('height', 15)
                        .append("xhtml:div")
                        .html('<div style="font-size:75%;color:'+baseColorLight+';">'+val+'</div>')
    }


    tooltipEvents();
  };

var tooltipEvents = function(){
  var tooltipTimer;
  $(".info").unbind('mouseenter mouseleave').hover(function(){
        //if(tooltipTimer){
          //clearTimeout(tooltipTimer);
        //}
        var ev = event;
        var el = $(this);
        //var tooltipTimer = setTimeout(function(){
          var x = ev.x;
          if(x + .3*window.innerWidth > window.innerWidth){
            x = x - .3*window.innerWidth;
          }
          $(".tooltip").css({
            "top" : ev.y + "px",
            "left" : x + "px",
          }).html(helpText[el.data("help")]);
          $(".tooltipCont").show();
        //},0);
    });
    $(".tooltipValue").unbind('mouseenter mouseleave').hover(function(){
      $(".tooltip").css({
          "top" : event.y + "px",
          "left" : event.x + "px",
      }).html($(this).attr("value"));
      $(".tooltipCont").show();
    });

    $(".tooltipCont").unbind('mouseenter mouseleave').hover(function(){
      $(this).hide();
    })
};

var filterEvents = function(){

    $(".ctypes .ctype").on("click",function(){
      var el = $(this);
      var type = parseInt(el.data(type).type);
      d3.selectAll(".countryDyadType").style("stroke",baseColor).style("stroke-width","0.2px");
      var isActive = el.hasClass("active");
      $(".ctypes .ctype").removeClass("active");
      if(!isActive){
        d3.selectAll(".dt_"+type+" .countryDyadType").style("stroke",highlightColor).style("stroke-width",0.5);
        el.addClass("active");
      }
    });


     $(".filter").on("click",function(){
        $(this).find(".hidden").toggle();
     });
     $(".filter.conflicts .hidden .label").on("click",function(){   
         var el = $(this);
         if(!el.hasClass("active")){
            $(".filter .hidden .label.active").removeClass("active");
            el.addClass("active");
            el.parent().parent().find(".selected").text(el.data("text"));
            var val = parseInt(el.data("val"));
            if(val == 0){
              conflictTypes = [1,2,3];
            }else{
              conflictTypes = [val];
            }
         }
         $(".header .sub").removeClass('disabled');
         el.parent().find(".hidden").hide();
     });  

     $(".filter.indicators .hidden .label").on("click",function(){   
         changed = "indicator";
         var el = $(this);
         if(!el.hasClass("active")){
            $(".filter .hidden .label.active").removeClass("active");
            el.addClass("active");
            el.parent().parent().find(".selected").text(el.data("text"));
            indicatorType = el.data("val");
            indicator = el.data("text");
            impactDomain = [];
         }
         $(".header .sub").removeClass('disabled');
         el.parent().find(".hidden").hide();
     });  
  };

  return {

    filterEvents : function(){
      filterEvents();
    },

    drawGeoMap : function(d){
      drawMapConnections(d);
    },
    renderDyadConflicts : function(doneCallback){
      //With this query I get the list of countries in order of most intense
      // conflicts over all the year
      var q = JSON.parse(JSON.stringify(es_queries["sequence_dyads"]));
      q["query"]["bool"]["must"][0]["range"]["year"]["gte"] = timePeriod.from;
      q["query"]["bool"]["must"][0]["range"]["year"]["lte"] = timePeriod.to;
      q["query"]["bool"]["must"][1]["terms"]["type_of_conflict"] = conflictTypes;

      runQ(q,function(aggs){
        var data = aggs.aggregations.country_dyads.buckets, seq=[], dyads=[];
        for(var i=0;i<data.length;i++){
          if(data[i].dyads.buckets.length) 
            dyads.push(data[i]);
        }
        countryOfDyads = {};
        conflictCountries = dyads.map(function(o){
          if(o.dyads.buckets.length) 
            return o.key;
        });
        getConflictsDyad(dyads,0,0,0,function(){
          doneCallback();
        });
      })
    },

    drawTimeline : function(){
      drawTimeline();

      var countryDyadsCont = dyadsCont.append("g")
                   .attr("class","countryDyadsCont")
                   .attr("ccd", countrySelected[1]);
      var ct=0;
      for(var d in countryOfDyads){
        var dyad = countryOfDyads[d];
        if(dyad["ccd"] == countrySelected[1]){
          countryConflictTimeline(countryDyadsCont,dyad["d_name"],d,dyad["type"],dyad["timeline"],ct);    
          ct++;
        }
      }
    },
    setup : function(width){
      var ww = width || w;
      dyadsCont = d3.select("#dyads")
                    .append("svg")
                    .attr("width", ww)
                    .attr("height", $("#dyads").height())
                    .attr("id","dyadsCont");
      // dyadsCont = svg.append("g").attr("id","dyadsCont");

      timeline = d3.select(".timeline .container").append("svg")
                       .attr("id","timeline")
                       .attr("width", ww)
                       .attr("height",$(".timeline").height());

      drawMapSkeleton();
      highlighCountry();
    },
    clear : function(){
        $("#dyadsCont").empty();
        $("#timeline").empty();
        $(".indicator svg").remove();
        $(".ctypes .ctypes").removeClass("active");
    },
    clearIndicator : function(){
      $("#indicator").empty();
    },
    resize : function(wi){
      w = wi;
      dyadsCont.attr("width",wi);
      timeline.attr("width",wi);
      indi.attr("width",wi);
    },
    init : function(){
          SSAConflict.renderConflictCountry();
          SSAConflict.drawTimeline();
          SSAConflict.drawGeoMap();
          SSAConflict.renderIndicator("ineq");
          SSAConflict.renderIndicator("cr");
          SSAConflict.renderIndicator("health");
          setTimeout(function(){
            SSAConflict.filterEvents();
          },3000)
    },

    renderConflictCountry : function(){
        var q = es_queries["conflict_country_yr"];
        q["query"]["bool"]["must"][0]["term"]["ccd"]["value"] = countrySelected[1];
        q["query"]["bool"]["must"][1]["range"]["year"] = {"gte" : timePeriod.from,"lte" : timePeriod.to};

        runQ(q,function(data){
            var data = data.aggregations.by_year.buckets;
            var ht = parseInt(dyadsCont.attr("height"));
            var impactDomain = [5000,1000];
            var x = d3.scaleLinear()
                      .domain([timePeriod.from, timePeriod.to+1])
                      .range([0, w]);
            var y = d3.scaleLinear()
                      .domain(impactDomain)
                      .range([0, ht]);
            for(var i=0;i<data.length;i++){
              dyadsCont.append("rect")
                       .attr("x",x(data[i].key))
                       .attr("y",y(data[i].sum_v.value))
                       .attr("width", x(data[i].key+1)-x(data[i].key))
                       .attr("height", ht-y(data[i].sum_v.value))
                       .style("fill",highlightColor);
            }

            //Adding the y axis labels here
            var impactInterval = parseInt((impactDomain[0]-impactDomain[1])/2);
            for(var i=0; i<=2;i++){
              var txtLable = dyadsCont.append('g')
              var val = parseInt(i*impactInterval+impactDomain[1]);
              txtLable.append("rect")
                    .attr("x", 0)
                    .attr("y", y(val)-10*(2-i))
                    .attr("width",15)
                    .attr("height",15)
                    .attr("fill",bgColor);
              txtLable.append('foreignObject')
                                .attr('x', 0)
                                .attr('y', y(val)-7.5*(2-i))
                                .attr('width', 15)
                                .attr('height', 15)
                                .append("xhtml:div")
                                .html('<div style="font-size:75%;color:'+baseColorLight+';">'+val+'</div>')
            }
        });
    },

    renderIndicator : function(indicatorType){
        var indi = d3.select(".indicator."+indicatorType).append("svg")
                       .attr("id","indicator")
                       .attr("width", w)
                       .attr("height", $(".indicator").height());
        var indiq = es_queries["indicator"][indicatorType];
        var colorToSend = indiq["color"] || secondHighlightColor;
        var q = indiq["q"]["max_min"];
        runQ(q,function(data){
            var impactDomain = [parseFloat(data.aggregations.perc.values["80.0"]),parseFloat(data.aggregations.perc.values["20.0"])];
            var q = indiq["q"]["ssa"];
            runQ(q,function(data){
                // unempIndicator(indicatorType,data.aggregations.by_year.buckets.map(function(d){
                //   return {
                //     "key" : d.key,
                //     "value" : d.avg_v.value
                //   }
                // }),"ssa",impactDomain, indi);
                var indiq = es_queries["indicator"][indicatorType];
                var q = indiq["q"]["country"];
                q["query"]["bool"]["must"][0]["terms"]["ccode"] = [countrySelected[1]];
                q["query"]["bool"]["must"][1]["range"]["yr"] = {"gte" : timePeriod.from,"lte" : timePeriod.to};
                runQ(q,function(data){
                    unempIndicator(indicatorType,data.hits.hits.map(function(d){
                        return {
                          "key" : d._source.yr,
                          "value" : d._source.value
                        }
                      }),colorToSend,"countryIndicator",impactDomain,indi);
                },indiq.index,indiq.type);

            },indiq.index,indiq.type);
        },indiq.index,indiq.type);
    }

  }

})();


SSAConflict.setup();


