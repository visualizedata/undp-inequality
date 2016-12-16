var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var S = require('string');
var wordpos = require('wordpos');
var deferred = require('deferred');
var subpageError = false;
var rita = require('rita');


var WP = new wordpos({profile: true});
var $;


var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200'
});

var headlines = [], wordScoreObj = {};

function storeWordScore(yr,headline,word,pos,score){
    wordScoreObj[yr] = wordScoreObj[yr] || {};
    if(headline.match(/(reasons|why|impact|effect|causes|look|costs|what|measure)/g)){
      score += 1;
    }
    if(headline.indexOf("conflict")>-1){
      score += 0.5;
    }
    if(wordScoreObj[yr][word]){
      wordScoreObj[yr][word]["score"] += score;
    }else{
      wordScoreObj[yr][word] = {"score" : score};
    }
    wordScoreObj[yr][word]["pos"] = pos;
};


function getWords(yr,headline,score){
  try{
      var rs = rita.RiString(headline);
      var pos = rs.pos();
      var words = rs.words();
      var refinedWords = [];
      for(var i=0; i < pos.length;i++){
          if(pos[i] == "nn" || pos[i] == "nnp" || pos[i] == "nnps"){
              storeWordScore(yr,headline,words[i],pos[i],score);
              refinedWords.push(words[i]);
          }
      }
      return {
        "or" : headline,
        "new" : refinedWords.join(" "),
        "yr" : yr
      };
    }
    catch(err){
      return false;
    }
}

var def;
function parseHeadlines(yr,rows,ct,subpage){
  if(rows && ct < rows.length){
    rows[ct] = rows[ct].replace(/(<b>|<\/b>)/g,"");
    $ = cheerio.load(rows[ct]);
    var headline = $("a").html();
    headline = headline ? headline.replace(/<(.)*>/g,"").replace(/=/g,"").replace(/[\n\r]/g,"") : "";
    headline = headline.toLowerCase();
    headline = getWords(yr,headline,(1000-((subpage-1)*10+ct))*.001);
    if(headline){
      headlines.push(headline);
    }
    ct++;
    parseHeadlines(yr,rows,ct,subpage);
  }
}

function guardianRequest(yr,subpage){
    try{
        console.log("reading "+yr + " -- " +subpage);
        var file = fs.readFileSync("./dumps/scholar2/"+yr+"_"+subpage+".mht");
        subpageError=false;
        file = file.toString();
        file = file.replace(/[\n\r]/g,"");
        file = file.replace(/3D/g,"");
        $ = cheerio.load(file);
        var titles = $("body").html().match(/<h3(.|\n)*?<\/h3>/g);
        parseHeadlines(yr,titles,0,subpage);
        subpage++;
        guardianRequest(yr,subpage);
      }
      catch(err){
        console.log(err);
        if(!subpageError){
            subpageError=true;
            console.log(JSON.stringify(wordScoreObj[yr]));
            console.log("flushing - "+headlines.length);
            var promise = elPost(headlines,yr);
            promise.done(function(){
              headlines = [];
              yr++;
              guardianRequest(yr,1);
            });
        }else{

        }
      }
  }

function elPost(headlines,yr){
  var def1 = deferred(), stmts=[];
  for(var i=0;i<headlines.length;i++){
    stmts.push({ index:  { _index: 'scholar', _type: 'headline', _id : "i_"+i+"_"+parseInt(Math.random()*1000) } });
    stmts.push(headlines[i]);
  }
  client.bulk({
    body: stmts
  }, function (error, response) {
        stmts = [];
        var wordScoreObjYr = wordScoreObj[yr];
        for(var  word in wordScoreObjYr){
          stmts.push({ index:  { _index: 'scholar', _type: 'word', _id : "w_"+parseInt(Math.random()*10000) } });
          stmts.push({
            "word" : word,
            "yr" : yr,
            "scoreVal" : wordScoreObjYr[word]["score"],
            "pos" : wordScoreObjYr[word]["pos"]
          });
        }
        client.bulk({
          body: stmts
        }, function (error, response) {
          def1.resolve();
        });
  });
  return def1.promise;
}

function el(){
    client.create({
      index: 'test',
      type: 'user',
      body: {
        name: 'sakshi',
      }
    }, function (error, response) {
      console.log(response);
    });

    /*
    client.search({
      index: 'test',
      type: 'user',
      body: {
        query: {
          match_all: {}
        }
      }
    }).then(function (resp) {
        var hits = resp.hits.hits;
        console.log(hits.length);
    }, function (err) {
        //console.trace(err.message);
    });
    */
}

guardianRequest(2004,1);

//el();
