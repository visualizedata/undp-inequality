
var  CompareVariable = (function(){
 
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


  var comapre = function(){

  }

  return {
    setup : function(){
      dyadsCont = d3.select("body")
                    .append("svg")
                    .attr("width", window.innerWidt)
                    .attr("height", $("#dyads").height()*10)
                    .attr("id","dyadsCont");
    }
  }


})();



