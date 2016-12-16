var mapObj;
var countryOfDyads = {};

var dontShowUncertainty = dontShowUncertainty || false;

var timePeriod = {
  "from" : 1989,
  "to" : 2014
};
var estimate = 1;
var indicatorPercentile = [80,0];

var outlierColor = "#000000";
var bgColor = "#f9f9f9"
var baseColor = "#4A4A4A";
var baseColorLight = "#bbbbbb";
var highlightColor = "#EF5050";
var secondHighlightColor = "#006e98";
var healthColor = "#4c9f38";


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


var helpText = {
  "cr" : "Total enrollment in primary education, regardless of age, expressed as a percentage of the population of official primary education age.<br> ",
  "unemp" : "Unemployment, total (% of total labor force) (modeled ILO estimate)",
  "ct1" : "Fighting either between two states, or between a state and a rebel group that challenges it",
  "ct2" : "Conflicts in which none of the warring parties is a state",
  "ct3" : "The use of armed force by the government of a state or by a formally organized group against civilians which results in at least 25 deaths in a year",
  "i1" : "Countries in Africa have gone through a number of conflicts ever since their independence from colonial rule. Here we try to analyse those conflicts and the resulting deaths.<br><br> Conflicts result because of a disagreement between two groups either of which can be government or not. Violence due to conflicts not only results in deaths and destruction of property but a greater collateral damage leading to a complete breakdown of society.",
  "i2" : "We measure the growth of a country using GDP per capita (US $) which gives an estimate of the average income per person in a country.",
  "conflicts" : "Conflict Violence is represented by number of deaths or casualties caused by conflicts. Each bar here represents total deaths in a single year. That is what the height of the bar denotes. The y axis scale is 0,3500,7000 deaths.",
  "legend" : "<b>HOW GOOD IS THIS DATA?</b><br>There is some amount of assumption taken while recording these events and hence an error is always possible. The bars show a high estimation as well as a low estimation level for the number of deaths.<br><br>  <b>HIGH ESTIMATION</b> takes highly clear events(sufficient detailed informationp present) as well as low clear events(sufficient detailed information NOT present) and the highest possible number of deaths possible.<br> <b>BEST ESTIMATION</b> only takes highly clear events and best possible number of deaths.",
  "dataQuality" : "<b>HOW GOOD IS THIS DATA?</b><br>There is some amount of assumption taken while recording these events and hence an error is always possible.<br><br> There are <b>highly clear events</b>(sufficient detailed information present) and <b>low clear events</b> (sufficient detailed information NOT present). <br>Also with each event there is a highest possible number of deaths and best possible number of deaths. The chart here takes the highest possible number of deaths.",
  "gdp" : "The GDP per capita of the country in US$. GDP per capita is a measure of average income per person in a country. ",
  "ineq" : "Inequality is measured using GINI coeffecient and represents the income distribution of a nation's residents. The value lies between 0 and 100 where 100 denotes maximum inequality and 0 as NO inequality.",
  "health" : "Total "
}

var conflictTypes = [1,2,3], indicator = "Primary Enrollment", changed, countrySelected = ["Sudan","SDN"];

var  SSAConflict = (function(){
  var w = window.innerWidth*.57, h = window.innerHeight*.7, svg, dyadsCont, timeline, indi, countryDyadsCont, conflictCountries;
  var lineTypes = ["0","2","8"], mainColor = "#00695c";
  
  var runQ = function(q,c,ind,type){
    // var basesearchurl = "http://localhost:9200/";
    var basesearchurl = "http://35.161.122.132:9200/";
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
      $(".user_selection .label .selected").text(cname);
      d3.selectAll(".countryGeo")
      	.style("stroke-width",0.8)
      	.style("stroke",baseColorLight);

      d3.select(".country_"+c)
      	.style("stroke-width",2  )
      	.style("stroke","#000")
        .style("stroke-opacity",1);
  };


  //This is where the skeleton is drawn with the conflict intensity.
  var drawMapSkeleton = function(){
    var q = es_queries["conflict_country"];
    q["query"]["bool"]["must"][0]["terms"]["clarity"] = estimate == 1 ? [1,2] : [1];
    q["aggs"]["country_inq"]["aggs"]["sum_v"]["sum"]["field"] = estimate == 1 ? "high_est" : "best_est";
    runQ(q,function(data){
      var co_in_ob = {}, data = data.aggregations.country_inq.buckets;
      //If I keep it 100000, only two countries are above it. 
      var max=100000;
      for(var i=0;i<data.length;i++){ 
        co_in_ob[data[i]["key"]] = data[i]["sum_v"]["value"];
      }
      $(".mapLegend .keys").empty();
      for(var i=5;i>0;i--){
        $(".mapLegend .keys").append("<div class='key'><div class='label'>"+parseInt(max/(i*1000))+"k</div><div class='color'></div></div>");
      }
      var myCustomStyle = {
            fill: true,
            fillColor: highlightColor,
            fillOpacity: 0.2,
            color : baseColorLight,
            weight: 1
        }
      //This is just stupid.
      var zoomLevel = 3.1 + parseInt((window.innerHeight-700)/400)*.5;
      if(!mapObj){
        mapObj = L.map('mapp',{
            center : [2.4530702,19.035771],
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
      }else{
        mapObj.eachLayer(function (layer) {
            mapObj.removeLayer(layer);
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

      highlighCountry();
    },"ucdp","event");
  }

  //Just the timeline 1820-2014
  var drawTimeline = function(){
    var marginTop =20, marginRight=0, timeInterval =7, marginLeft=0, fontSize=window.innerHeight*.02;
    var yrInterval = parseInt((timePeriod.to  - timePeriod.from)/timeInterval);

    var yrStart = timePeriod.from;

    var x = d3.scaleLinear()
            .domain([timePeriod.from, timePeriod.to+1])
            .range([marginLeft, w-marginRight-marginLeft]);
    var wy = x(timePeriod.formally+1) - x(timePeriod.from);
    timeline.append("line")
            .attr("x1",x(timePeriod.from))
            .attr("y1",marginTop)
            .attr("x2",x(timePeriod.to+1))
            .attr("y2",marginTop)
            .attr("stroke",baseColor);


    for(var i=timePeriod.from;i<=timePeriod.to;i++){
      timeline.append("rect")
          .attr("x", x(i))
          .attr("y",marginTop-2)
          .attr("width","2px")
          .style("height","4px")
          .style("fill",bgColor);
    }
    while(true){
      timeline.append("text")
          .attr("x", x(yrStart))
          .attr("y",marginTop)
          .attr("text-anchor","left")
          .attr("alignment-baseline","ideographic")
          .style("font-size",fontSize+"px")
          .style("font-weight","bold")
          .text(yrStart);

      if(yrStart > timePeriod.to){
        break;
      }else{
        yrStart += yrInterval;
      }
    }
  };

  //The unemployment indicator
  var drawIndicator = function(type,dataUnem, color,classs,impactDomain,indi){
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
                        .html('<div style="font-size:75%;color:'+baseColorLight+';">'+(val>1000 ? parseInt(val/1000)+"k": val)+'</div>')
    }

    //Time indicator lines
    var x = d3.scaleLinear()
            .domain([timePeriod.from, timePeriod.to+1])
            .range([0, w]);
    var wy = x(timePeriod.from+1) - x(timePeriod.from);

    for(var i=timePeriod.from;i<=timePeriod.to;i++){
      indi_g.append("line")
          .attr("x1", x(i))
          .attr("y1",ht)
          .attr("x2", x(i))
          .attr("y2",0)
          .style("stroke",baseColorLight)
          .style("stroke-opacity","0.8")
          .style("stroke-width","0.5px");
    }
    
  };

  var tooltipEvents = function(){
    var tooltipTimer;
    $(".info").unbind('click').on("click",function(){
          // clearTimeout(tooltipTimer);
          var ev = event;
          var el = $(this);
            var x = ev.x;
            if(x + .3*window.innerWidth > window.innerWidth){
              x = x - .3*window.innerWidth;
            }
            $(".tooltip").css({
              "top" : ev.y+10 + "px",
              "left" : x + "px",
            }).html(helpText[el.data("help")]);
            $(".tooltipCont").show();
      });
      $(".tooltipValue").unbind('click').on("click",function(){
        $(".tooltip").css({
            "top" : event.y + "px",
            "left" : event.x + "px",
        }).html($(this).attr("value"));
        $(".tooltipCont").show();
      });

      // $(".tooltipCont").unbind('mouseenter mouseleave').hover(function(){
      //     if(!$(event.target).hasClass("tooltip")){
      //       var el = $(this);
      //       tooltipTimer = setTimeout(function(){
      //         el.hide();  
      //       },0);
      //     }
      // })
      $(".tooltipCont").unbind('click').on("click",function(){
          if(!$(event.target).hasClass("tooltip")){
            $(this).hide();  
          };
      });
  };

  /**
  Almost any other interaction that you see.
  **/
  var otherEvents = function(){
      $(".country .selected").unbind("click").on("click",function(){
        $(".right .list").toggle();
      });
      $(".right .list .listItem").unbind("click").on("click",function(){
        $(".country .selected").text($(this).text());
        countrySelected = [$(this).text(),$(this).data("code")];
        $(".right .list").toggle();
        SSAConflict.reinit();
      });
  }


  var counflictOfCountry = function(){

  };

  return {

    addEvents : function(){
      tooltipEvents();
      otherEvents();
    },

    drawTimeline : function(){
      drawTimeline();
    },
    setup : function(width){
      var ww = width || w;
      dyadsCont = d3.select("#dyads")
                    .append("svg")
                    .attr("width", ww)
                    .attr("height", $("#dyads").height() - $("#dyads .label").height())
                    .attr("id","dyadsCont");

      timeline = d3.select(".timeline .container").append("svg")
                       .attr("id","timeline")
                       .attr("width", ww)
                       .attr("height",$(".timeline").height());
      drawMapSkeleton();
      
      $.each(Object.keys(countryCodes).sort(),function(i,v){
        $(".right .list").append("<div class='listItem' data-code='"+countryCodes[v]+"'>"+v+"</div>");
      })
    },

    clear : function(){
        $("#dyadsCont").empty();
        $("#timeline").empty();
        $(".indicator svg").remove();
    },
    reinit : function(){
        SSAConflict.clear();
        drawMapSkeleton();
        highlighCountry();
    },

    init : function(){
          SSAConflict.renderConflictCountry();
          SSAConflict.drawTimeline();
          SSAConflict.renderIndicator("gdp");
          // SSAConflict.renderIndicator("cr");
          // SSAConflict.renderIndicator("health");

          setTimeout(function(){
            SSAConflict.addEvents();
          },1500)
    },

    renderConflictCountry : function(){
        var q = es_queries["conflict_country_yr"];
        q["query"]["bool"]["must"][0]["term"]["ccd"]["value"] = countrySelected[1];
        q["query"]["bool"]["must"][1]["range"]["year"] = {"gte" : timePeriod.from,"lte" : timePeriod.to};
        runQ(q,function(data){
            var data = data.aggregations.by_year.buckets;
            var ht = parseInt(dyadsCont.attr("height"));
            var impactDomain = [7000,0];
            var x = d3.scaleLinear()
                      .domain([timePeriod.from, timePeriod.to+1])
                      .range([0, w]);
            var y = d3.scaleLinear()
                      .domain(impactDomain)
                      .range([0, ht]);
            for(var i=0;i<data.length;i++){
              var ob = data[i];
              var deathsHigh = ob["clarity"]["buckets"][0]["high"]["value"] + (ob["clarity"]["buckets"].length > 1 ? ob["clarity"]["buckets"][1]["high"]["value"] : 0);
              dyadsCont.append("rect")
                       .attr("x",x(ob.key))
                       .attr("y",y(deathsHigh))
                       .attr("width", x(ob.key+1)-x(ob.key))
                       .attr("height", ht-y(deathsHigh))
                       .attr("value",ob.key+"<br>"+"Number of conflicts - "+ob.doc_count)
                       .style("fill",secondHighlightColor)
                       .style("opacity",dontShowUncertainty ? "1" : "0.6");
              if(!dontShowUncertainty){
                var deathsBest = ob["clarity"]["buckets"][0]["best"]["value"];
                dyadsCont.append("rect")
                       .attr("x",x(ob.key))
                       .attr("y",y(deathsBest))
                       .attr("width", x(ob.key+1)-x(ob.key))
                       .attr("height", ht-y(deathsBest))
                       .style("fill",secondHighlightColor)
              }
            }

            //Adding the y axis labels here
            var impactInterval = parseInt((impactDomain[0]-impactDomain[1])/2);
            for(var i=0; i<=2;i++){
              var txtLable = dyadsCont.append('g')
              var val = parseInt(i*impactInterval+impactDomain[1]);
              txtLable.append("rect")
                    .attr("x", 0)
                    .attr("y", y(val)-10*(2-i))
                    .attr("width",20)
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

    //This is where the indicator which suffers is rendered
    renderIndicator : function(indicatorType){
        var indi = d3.select(".indicator."+indicatorType).append("svg")
                       .attr("id","indicator")
                       .attr("width", w)
                       .attr("height", $(".indicator").height()-$(".indicator .label").height());
        var indiq = es_queries["indicator"][indicatorType];

        var colorToSend =  secondHighlightColor || indiq["color"];
        var q = indiq["q"]["percentile"];
        q["aggs"]["perc"]["percentiles"]["percents"] = indicatorPercentile;
        runQ(q,function(data){
            var impactDomain = [parseFloat(data.aggregations.perc.values[indicatorPercentile[0]+".0"]),parseFloat(data.aggregations.perc.values[indicatorPercentile[1]+".0"])];
            var indiq = es_queries["indicator"][indicatorType];
            var q = indiq["q"]["country"];
            q["query"]["bool"]["must"][0]["terms"]["ccode"] = [countrySelected[1]];
            q["query"]["bool"]["must"][1]["range"]["yr"] = {"gte" : timePeriod.from,"lte" : timePeriod.to};
            runQ(q,function(data){
                drawIndicator(indicatorType,data.hits.hits.map(function(d){
                    return {
                      "key" : d._source.yr,
                      "value" : d._source.value
                    }
                  }),colorToSend,"countryIndicator",impactDomain,indi);
            },indiq.index,indiq.type);
        },indiq.index,indiq.type);
    }

  }

})();


SSAConflict.setup();


