// from pts analysis
    var init = countries['Algeria'];
    var hiOverall = init.overallPTS;
    var hiOverallCountry = 'Algeria';
    var hiTenYear = init.tenYearPTS;
    var hiTenYearCountry = 'Algeria';
    var hiFiveYear = init.fiveYearPTS; 
    var hiFiveYearCountry = 'Algeria';
 
    for (var country in countries) {
        // find which countries have highest PTS
        var current = countries[country];

        if (!isNaN(current.overallPTS) && current.overallPTS > hiOverall) {
            hiOverall = current.overallPTS;
            hiOverallCountry = country;
        }
            
        if (!isNaN(current.tenYearPTS) && current.tenYearPTS > hiTenYear) {
            hiTenYear = countries[country].tenYearPTS;
            hiTenYearCountry = country;
        }
        
        if (!isNaN(current.fiveYearPTS) && current.fiveYearPTS > hiFiveYear) {
            hiFiveYear = countries[country].fiveYearPTS;
            hiFiveYearCountry = country;
        }
        
    }
    
    console.log('highest overall: '+hiOverallCountry+' '+hiOverall);
    console.log('highest ten year: '+hiTenYearCountry+' '+hiTenYear);
    console.log('highest five year: '+hiFiveYearCountry+' '+hiFiveYear);
    //end from PTS analysis