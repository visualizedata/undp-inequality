var wordsInYear = {};

//1997-Jan-Apr
function setup(){
  createCanvas(windowWidth,windowHeight);
  getDataFromMultipleFiles(1990,1);
}


var words = [];

//var neg1 = "Perpetrator","Rape","Coercion","Harassment","protest","Bloodshed","Brutality","Klan","Abuse","Aggression","Prevention","Domestic","Terrorism","Pornography","Assault","Racism","Homelessness","Homicide","Looting","Oppression","Victim","Trafficking","Arson","Riot","Intolerance","Extortion","Repression","Prostitution","Unrest","Parenting","Cruelty","Sexuality","Robbery","Genocide","Injustice","Gang","Hatred","Homosexual","Propensity","Trauma","Handgun","Depiction","Offender","Cartel","Recourse","Insurgency","Outburst","Killing","Provocation","Threat","Ceasefire","Crime","Incarceration","Adolescent","Sectarian","Abusive","Senseless","Communal","Paramilitary","Violent","Battered","Sporadic","Lawless","Transgender","Overt","Brutal","Rampant","Escalate","Perpetrate","Incite","Erupt","Resort","Condemn","Instigate","Combat","Bully","Abate","Aggravate";


var negativeWords = ["deaths","failure","conflict","war","bias","coup","death"];
var positiveWords = ["development","peace","progress","innovation","profit",];

function getDataFromMultipleFiles(yr,ct){
  loadTable("data/reference/qualitative/csv/"+yr+"-"+ct+".csv","csv","header",function(data){
    try{
      var count = data.getRowCount();
      var words = [];
      for(var i=0;i<count;i++){
        var headline = data.getString(i,3);
        //console.log(headline);
        words = words.concat(headline.toLowerCase().split(" "));
      }
      wordsInYear[yr] = words;
      getDataFromMultipleFiles(yr,++ct);
    }
    catch(err){
      if(ct > 1){
        yr++;
        getDataFromMultipleFiles(yr,1);
      }else{
        countWords();
        visualize();
      }
    }
  });
}

function readFile(yr){
    loadTable("data/reference/qualitative/csv/"+yr+".csv","csv","header",function(data){
      try{
        var count = data.getRowCount();
        var words = [];
        for(var i=0;i<count;i++){
          var headline = data.getString(i,3);
          //console.log(headline);
          words = words.concat(headline.toLowerCase().split(" "));
        }
        wordsInYear[yr] = words;
        yr++;
        getDataForYr(yr);
      }
      catch(err){
        countWords();
        visualize();
      }
    });
}
var frequenceYrPos  = {},frequenceYrNeg  = {};
function countWords(){
    for(var yr in wordsInYear){
      var words = wordsInYear[yr];
      frequenceYrPos[yr] = {};
      frequenceYrNeg[yr] = {};
      for(var i=0;i< words.length;i++){
        if(positiveWords.indexOf(words[i])>-1){
          frequenceYrPos[yr][words[i]] = frequenceYrPos[yr][words[i]] ? frequenceYrPos[yr][words[i]] + 1 : 1;
        }else if(negativeWords.indexOf(words[i])>-1){
          frequenceYrNeg[yr][words[i]] = frequenceYrNeg[yr][words[i]] ? frequenceYrNeg[yr][words[i]] + 1 : 1;
        }
      }
    }
}

function visualize(){
  var barWidth = 30, barHeight=30, yr=1990, ct=0;
  for(var i=0;i<Object.keys(wordsInYear).length;i++){
    var x = barWidth*(i+1) + i*20;
    yrObj = frequenceYrNeg[yr+i];
    ct = 0;
    for(var word in yrObj){
      var y = windowHeight/2 - ct*barHeight - ct*10;
      var transparency = yrObj[word]/5;
      fill("rgba(244,67,54,"+transparency+")");
      noStroke();
      ellipse(x,y, barWidth,barHeight);
      ct++;
    }
    yrObj = frequenceYrPos[yr+i];
    ct=0;
    for(var word in yrObj){
      var y = windowHeight/2+barHeight+10 + ct*barHeight + ct*10;
      var transparency = yrObj[word]/5;
      fill("rgba(21,101,192,"+transparency+")");
      noStroke();
      ellipse(x,y, barWidth,barHeight);
      ct++;
    }

  }
}
