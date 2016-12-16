var Renderer = (function(){


  var helpText = {
    "title" : "This visualization tries to understand what kind of research academic scholars have carried out around conflicts in Africa specifically related to its impact and cause. For this it analyses top 1000 search results from Google Academic Scholar for each year between 1970-2016. Each search result is analysed for its headline to understand its focus which is ultimately aggregated to find a larger focus over a time period.",
    "highcor" : "Every word in the headline is given a score which depends on following criteria.<ul>  <li> The ranking of search result/headline in Google Scholar search results </li> <li> If the headlines has additional words like 'reasons','why','impact','look','costs' </li> <li> If the headline includes the word 'conflict'. </li> <br> Also, some words show a high correlation (get a very high score) not just for that time period (2yrs, 5yrs) but generally over time."
}

  var years = { "2010-2016" : [ { "word" : "test1", "score" : 10}, { "word" : "test2", "score" : 8},{ "word" : "test3", "score" : 6}, { "word" : "test2", "score" : 5},{ "word" : "test3", "score" : 4},{ "word" : "test1", "score" : 10}, { "word" : "test2", "score" : 8},{ "word" : "test3", "score" : 6}, { "word" : "test2", "score" : 5},{ "word" : "test3", "score" : 4},{ "word" : "test1", "score" : 10}, { "word" : "test2", "score" : 8},{ "word" : "test3", "score" : 6}, { "word" : "test2", "score" : 5},{ "word" : "test3", "score" : 4},{ "word" : "test1", "score" : 10}, { "word" : "test2", "score" : 8},{ "word" : "test3", "score" : 6}, { "word" : "test2", "score" : 5},{ "word" : "test3", "score" : 4}] } ;

  var drawYearData = function(yrData){
    var yr = yrData.yr;
    var words = yrData.words;

    //The outer container
    $(".outerContainer").append("<div class='yearData "+yr+"'></div>");
    var yrDataCnt  = $(".yearData."+yr);

    //Adding year label
    yrDataCnt.append("<div class='yrLabel'>"+yr+"</span></div>");

    yrDataCnt.append("<div class='wordsO'><div class='arrow left'><</div><div class='arrow right'>></div><div class='words'></div></div>");

    var wordsCont = $(".words",yrDataCnt);

    var count = 0 ;

    for(var i=0;i<words.length;i++){
      if(words[i].score> 10){
        var fontsize = 50 + (100*(words[i].score/yrData["maxScore"])) + "%";
        var classToAdd  = "";
        if(words[i].score>75){
          classToAdd += "important";
        }
        wordsCont.append("<div class='word "+classToAdd+"' data-word='"+words[i].word+"' data-yr='"+yr+"' style='font-size:"+fontsize+";'>"+words[i].word+"</span></div>");
        count++;
      }
    }
    wordsCont.width((count*60) + "px");

  }

  var addEvents = function(){
    $(".word").on("click",function(ev){
      var word = $(this).data("word");
      var yr = $(this).data("yr");
      var q = es_queries["default_word_headlines_yr"];
      q.query.bool.must[0].range.yr.gte = parseInt(yr.split("-")[0]);
      q.query.bool.must[0].range.yr.lte = parseInt(yr.split("-")[1]);
      q.query.bool.must[1].term.new.value = word;
      var pos = $(this)[0].getBoundingClientRect();
       runQ(q,function(data){
          drawArticles(word,data.hits.hits,pos);
       },"headline")
    });

    $(".intervals .interval").on("click",function(){
        if($(this).hasClass("active")){
          return;
        }
        $(".intervals .interval").removeClass("active");
        $(this).addClass("active");
        var interval = parseInt($(this).data("interval"));
        fetchYrWords(interval,function(data){
          $(".outerContainer").empty();
          drawYears(data);
        });
    });

    $(".arrow").on("click",function(){
        var parent = $(this).parent();
        var toScroll = $(this).hasClass("right") ? 400 : (parent.scrollLeft()-400)<0 ? -1*(parent.scrollLeft()-400) : -400;
        parent.animate({scrollLeft: (parent.scrollLeft() + toScroll) + "px"}, 500,function(){
          if(parent.scrollLeft() >10){
            $(".arrow.left",parent).show();
          }else{
            $(".arrow.left",parent).hide();
          }
        });
    });
    $(".info").unbind('click').on("click",function(){
        // clearTimeout(tooltipTimer);
        var ev = event;
        var el = $(this);
        var x = ev.x;
        if(x + .2*window.innerWidth > window.innerWidth){
          x = x - .2*window.innerWidth;
        }
        $(".tooltip").css({
          "top" : ev.y+10 + "px",
          "left" : x + "px",
        }).html(helpText[el.data("help")]);
        $(".tooltipCont").show();
    });
    $(".tooltipCont").unbind('click').on("click",function(){
        if(!$(event.target).hasClass("tooltip")){
          $(this).hide();  
        };
    });

  };

  var drawArticles = function(word,articles,pos){
      debugger;
      $(".articles").empty().append("<div class='heading'><span class='main'>"+word+"</span><span class='count'>("+articles.length+" articles)</span></div><div class='headlines'></div>");
      $.each(articles,function(i,v){
          var rx = new RegExp(word, 'gi');
          v._source.or = v._source.or.replace(rx,"<span class='highlight'>"+word+"</span>");
          v._source.or = v._source.or.replace(/(reasons|why|impact|effect|causes|look|costs|what|measure)/g,"<span class='highlight yellow'>$&</span>");
          $(".articles .headlines").append("<div class='headline'>" + v._source.or+"<span class='yr'> ("+v._source.yr+")</span>&nbsp;(<a target='_blank' href='"+v._source.link+"'>link</a>)</div>");
      });
      $(".articles").append("<div class='close'></div>");
      $(".articles").show();

      $(".articles .close").on("click",function(){
          $(".articles").hide();
      });
      //.css({"top":""+(pos.top+20)+"px","left":""+(pos.left+150)+"px"});
  };
  //http://http://35.161.122.132:9200
  //http://localhost:9200
  var runQ = function(q,c,type){
    $.ajax({
      type: "POST",
      url: "http://35.161.122.132:9200/scholar/"+(type || "word") +"/_search",
      data: JSON.stringify(q),
      success: function(data){
        c(data);
      },
      dataType: "json"
    });
  };

  var drawYears = function(data){
      $.each(data,function(i,v){
        drawYearData(v);
      });
      addEvents();
  };

  var fetchYrWords = function(interval,callback){
      var q = es_queries["default_yr_interval_words"];
      q["aggs"]["years"]["histogram"]["interval"] = interval;
      runQ(q,function(data){
          var refinedData = [];
          if(data && data.aggregations){
            var bckts = data.aggregations.years.buckets;
            for(var i=0;i<bckts.length;i++){
              var arr = [];
              var words = bckts[i].words.buckets;
              var maxScore = 0;
              for(var j=0;j<words.length;j++){
                  arr.push({"word" : words[j].key, "score" : words[j].sum_v.value})
                  if(words[j].sum_v.value > maxScore){
                    maxScore = words[j].sum_v.value;
                  }
              }
              var yrKey = "";
              if((bckts[i].key+interval) > 2016){
                yrKey = bckts[i].key + "-2016";
              }else{
                yrKey = bckts[i].key+"-"+(bckts[i].key+interval-1)
              }
              refinedData.push({"yr" : yrKey,  "maxScore" : maxScore,"words" : arr});
            }
          }
          callback(refinedData);
      });
  };

  return {
    init : function(){
      fetchYrWords(5,function(data){
        drawYears(data);
      });
    }
  }

})();

Renderer.init();
