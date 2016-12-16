function visualChange(data, clr, clas){ 
                
                d3.selectAll(".funnelGroup").remove();
            
                var funnelGroup = canvas.selectAll('.'+clas)
                                    .data(data)
                                    .enter()
                                    .append('g'); 
            
            var a = function(d, i) { return width/2 + parseFloat(mapX1(d['enrolPrimary']))/2 - 20;};
            console.log(" a = " + a);
            var b = function(d, i) { return (width/2 + parseFloat(mapX1(d['enrolPrimary']))/2 - 20 - width/2 - parseFloat(mapX1(d['enrolPrimary']))/2 + 20);};
            console.log(" b = " + b);
            var c =  a - b;
            console.log(" c = " + c);
            
                var primary1 = funnelGroup
                                .append("circle")
                                .attr("class", clas)
                                .attr('cx', function(d, i) { return width/2 + parseFloat(mapX1(d['enrolPrimary']))/2 - 20;})
                                .attr('cy', 20 + 50)
                                .attr('r', 6)
                                .attr('fill', clr)
                                .attr('fill-opacity', 0.5);
                var primary2 = funnelGroup
                                .append("circle")
                                .attr("class", clas)
                                .attr('cx', function(d, i) { return width/2 - parseFloat(mapX1(d['enrolPrimary']))/2 + 20;})
                                .attr('cy', 20 + 50)
                                .attr('r', 6)
                                .attr('fill', clr)
                                .attr('fill-opacity', 0.5);
                                
                var check = funnelGroup
                                .append("rect")
                                .attr("class", clas)
                                .attr('x', function(d, i) { return width/2 - parseFloat(mapX1(d['enrolPrimary']))/2 + 20 ;})
                                .attr('y', 18.75 + 50)
                                .attr('width', function(d, i) { return (width/2 + parseFloat(mapX1(d['enrolPrimary']))/2 - 20 - (width/2 - parseFloat(mapX1(d['enrolPrimary']))/2 + 20));})
                                .attr('height', 2.5)
                                .style("fill", clr)
                                .attr('fill-opacity', 0)
                                ;
        
            
                var secondary1 = funnelGroup
                                .append("circle")
                                .attr("class", clas)
                                .attr('cx', function(d, i) { if(d['enrolSecondary'] !== ""){return width/2 + parseFloat(mapX2(d['enrolSecondary']))/2 - 20;}})
                                .attr('cy', function(d, i) { if(d['enrolSecondary'] !== ""){return height/2;}else{return 10000;}})
                                .attr('r', 6)
                                .attr('fill', clr)
                                .attr('fill-opacity', 0.5); 
                var secondary2 = funnelGroup
                                .append("circle")
                                .attr("class", clas)
                                .attr('cx', function(d, i) { if(d['enrolSecondary'] !== ""){return width/2 - parseFloat(mapX2(d['enrolSecondary']))/2 + 20;}})
                                .attr('cy', function(d, i) { if(d['enrolSecondary'] !== ""){return height/2;}else{return 10000;}})
                                .attr('r', 6)
                                .attr('fill', clr)
                                .attr('fill-opacity', 0.5);                 
            
                var primSec1 = funnelGroup
                                .append("line")
                                .attr("class", clas)
                                .attr("x1", function(d, i) { if(d['enrolSecondary'] !== ""){return width/2 + parseFloat(mapX1(d['enrolPrimary']))/2 - 20; }})
                                .attr("y1", function(d, i) { if(d['enrolSecondary'] !== ""){return 20 + 50;}else{return 10000;}})
                                .attr("x2", function(d, i) { if(d['enrolSecondary'] !== ""){return width/2 + parseFloat(mapX2(d['enrolSecondary']))/2 - 20;}})
                                .attr("y2", function(d, i) { if(d['enrolSecondary'] !== ""){return height/2;}else{return 10000;}})
                                .attr("stroke-width", 2)
                                .attr("stroke-opacity", 0.2)
                                .attr("stroke", clr);
                                
                var primSec2 = funnelGroup
                                .append("line")
                                .attr("class", clas)
                                .attr("x1", function(d, i) { if(d['enrolSecondary'] !== ""){return width/2 - parseFloat(mapX1(d['enrolPrimary']))/2 + 20; }})
                                .attr("y1", function(d, i) { if(d['enrolSecondary'] !== ""){return 20 + 50;}else{return 10000;}})
                                .attr("x2", function(d, i) { if(d['enrolSecondary'] !== ""){return width/2 - parseFloat(mapX2(d['enrolSecondary']))/2 + 20;}})
                                .attr("y2", function(d, i) { if(d['enrolSecondary'] !== ""){return height/2;}else{return 10000;}} )
                                .attr("stroke-width", 2)
                                .attr("stroke-opacity", 0.2)
                                .attr("stroke", clr)
                                ;
                                
                var tertiary1 = funnelGroup
                                .append("circle")
                                .attr("class", clas)
                                .attr('cx', function(d, i) { if(d['enrolTertiary'] !== ""){return width/2 + parseFloat(mapX3(d['enrolTertiary']))/2 - 20;}})
                                .attr('cy', function(d, i) { if(d['enrolTertiary'] !== ""){return height - 40 - 30;}else{return 10000;}})
                                .attr('r', 6)
                                .attr('fill', clr)
                                .attr('fill-opacity', 0.5);
                var tertiary2 = funnelGroup
                                .append("circle")
                                .attr("class", clas)
                                .attr('cx', function(d, i) { if(d['enrolTertiary'] !== ""){return width/2 - parseFloat(mapX3(d['enrolTertiary']))/2 + 20;}})
                                .attr('cy', function(d, i) { if(d['enrolTertiary'] !== ""){return height - 40 - 30;}else{return 10000;}})
                                .attr('r', 6)
                                .attr('fill', clr)
                                .attr('fill-opacity', 0.5);                
                                
                                
                var secTer1 = funnelGroup
                                .append("line")
                                .attr("class", clas)
                                .attr("x1", function(d, i) { if(d['enrolTertiary'] !== ""){return width/2 + parseFloat(mapX2(d['enrolSecondary']))/2 - 20; }})
                                .attr("y1", function(d, i) { if(d['enrolTertiary'] !== ""){return height/2;}else{return 10000;}})
                                .attr("x2", function(d, i) {  if(d['enrolTertiary'] !== ""){return width/2 + parseFloat(mapX3(d['enrolTertiary']))/2 - 20;}} )
                                .attr("y2", function(d, i) { if(d['enrolTertiary'] !== ""){return height - 40 - 30;}else{return 10000;}})
                                .attr("stroke-width", 2)
                                .attr("stroke-opacity", 0.2)
                                .attr("stroke", clr)
                                ;
                                
                var secTer2 = funnelGroup
                                .append("line")
                                .attr("class", clas)
                                .attr("x1", function(d, i) { if(d['enrolTertiary'] !== ""){return width/2 - parseFloat(mapX2(d['enrolSecondary']))/2 + 20; }})
                                .attr("y1", function(d, i) { if(d['enrolTertiary'] !== ""){return height/2;}else{return 10000;}})
                                .attr("x2", function(d, i) { if(d['enrolTertiary'] !== ""){return width/2 - parseFloat(mapX3(d['enrolTertiary']))/2 + 20;} })
                                .attr("y2", function(d, i) { if(d['enrolTertiary'] !== ""){return height - 40 - 30;}else{return 10000;}})
                                .attr("stroke-width", 2)
                                .attr("stroke-opacity", 0.2)
                                .attr("stroke", clr)
                                ;
                                
                var tooltip =  funnelGroup
                                 .on("click", function(d) { 
                                        
                                $("#graph1").empty();
                                $("#graph2").empty();
                                $("#graph3").empty();
                                $("#graph4").empty();
                                // $("#graph5").empty();
  
                                var ttwidth = width - 100;
                                var graphWidth = ttwidth/4;
                                                    
                                d3.select("#country")
                                        .attr("x", (ttwidth)/2)
                                        .attr("y", 5)
                                        .text(d['country'] + ": change over time");
                                        
                                var mapygraph1 = d3.scaleLinear().domain([0, 100]).range([7*(graphWidth/8), graphWidth/8]);
                                var mapygraph2 = d3.scaleLinear().domain([0, 100]).range([7*(graphWidth/8), graphWidth/8]);   
                                var mapygrpah3 = d3.scaleLinear().domain([0, 100]).range([7*(graphWidth/8), graphWidth/8]); 
                                var mapygraph4 = d3.scaleLinear().domain([25, 75]).range([7*(graphWidth/8), graphWidth/8]);
                                
                                for(var i = 1; i<=4; i++)
                                {
                                    var id = "#graph" + i;
                                    
                                d3.select(id)
                                        .attr("width", graphWidth)
                                        .attr("height", graphWidth);
                                
                                d3.select(id)
                                        .append("line")
                                        .attr("x1", graphWidth/8)
                                        .attr("y1", graphWidth/8)
                                        .attr("x2", (graphWidth/8)*7)
                                        .attr("y2", graphWidth/8)
                                        .attr('stroke', '#eaeaea')
                                        .attr('stroke-width', 2);
                                d3.select(id)
                                        .append("line")
                                        .attr("x1", graphWidth/8 )
                                        .attr("y1", graphWidth/8 + 2*(graphWidth/8))
                                        .attr("x2", (graphWidth/8)*7)
                                        .attr("y2", graphWidth/8 + 2*(graphWidth/8))
                                        .attr('stroke', '#eaeaea')
                                        .attr('stroke-width', 2);
                                d3.select(id)
                                        .append("line")
                                        .attr("x1", graphWidth/8)
                                        .attr("y1", graphWidth/8 + 4*(graphWidth/8))
                                        .attr("x2", (graphWidth/8)*7)
                                        .attr("y2", graphWidth/8 + 4*(graphWidth/8))
                                        .attr('stroke', '#eaeaea')
                                        .attr('stroke-width', 2);
                                d3.select(id)
                                        .append("line")
                                        .attr("x1", graphWidth/8)
                                        .attr("y1", graphWidth/8 + 6*(graphWidth/8))
                                        .attr("x2", (graphWidth/8)*7)
                                        .attr("y2", graphWidth/8 + 6*(graphWidth/8))
                                        .attr('stroke', '#eaeaea')
                                        .attr('stroke-width', 2);    
                                       
                                d3.select(id)
                                        .append("line")
                                        .attr("x1", graphWidth/8)
                                        .attr("y1", graphWidth/8)
                                        .attr("x2", graphWidth/8)
                                        .attr("y2", graphWidth/8 + 6*(graphWidth/8))
                                        .attr('stroke', '#eaeaea')
                                        .attr('stroke-width', 2);
                                d3.select(id)
                                        .append("line")
                                        .attr("x1", graphWidth/8 + 2*(graphWidth/8))
                                        .attr("y1", graphWidth/8 )
                                        .attr("x2", (graphWidth/8) + 2*(graphWidth/8))
                                        .attr("y2", graphWidth/8 + 6*(graphWidth/8))
                                        .attr('stroke', '#eaeaea')
                                        .attr('stroke-width', 2);
                                d3.select(id)
                                        .append("line")
                                        .attr("x1", graphWidth/8 + 4*(graphWidth/8))
                                        .attr("y1", graphWidth/8)
                                        .attr("x2", graphWidth/8 + 4*(graphWidth/8))
                                        .attr("y2", graphWidth/8 + 6*(graphWidth/8))
                                        .attr('stroke', '#eaeaea')
                                        .attr('stroke-width', 2);
                                d3.select(id)
                                        .append("line")
                                        .attr("x1", graphWidth/8 + 6*(graphWidth/8))
                                        .attr("y1", graphWidth/8)
                                        .attr("x2", graphWidth/8 + 6*(graphWidth/8))
                                        .attr("y2", graphWidth/8 + 6*(graphWidth/8))
                                        .attr('stroke', '#eaeaea')
                                        .attr('stroke-width', 2);  
                                
                                d3.select(id)
                                        .append("text")
                                        .attr("class", "label")
                                        .attr("x", graphWidth/8)
                                        .attr("y", 7*(graphWidth/8) + 15)
                                        .text("'90-'95")
                                        .attr("text-anchor", "middle");
                                d3.select(id)
                                        .append("text")
                                        .attr("class", "label")
                                        .attr("x", 7*(graphWidth/8))
                                        .attr("y", 7*(graphWidth/8) + 15)
                                        .text("'06-'10")
                                        .attr("text-anchor", "middle");                                
                                        
                                }
                                
                                    
                                d3.select("#graph1")
                                        .append("text")
                                        .attr("class", "graphTitle")
                                        .attr("x", graphWidth/2)
                                        .attr("y", 20)
                                        .text("primary enrollment rate")
                                        .attr("text-anchor", "middle");
                                
                                d3.select("#graph2")
                                        .append("text")
                                        .attr("class", "graphTitle")
                                        .attr("x", graphWidth/2)
                                        .attr("y", 20)
                                        .text("secondary enrollment rate")
                                        .attr("text-anchor", "middle");
                                d3.select("#graph3")
                                        .append("text")
                                        .attr("class", "graphTitle")
                                        .attr("x", graphWidth/2)
                                        .attr("y", 20)
                                        .text("tertiary enrollment rate")
                                        .attr("text-anchor", "middle"); 
                                d3.select("#graph4")
                                        .append("text")
                                        .attr("class", "graphTitle")
                                        .attr("x", graphWidth/2)
                                        .attr("y", 20)
                                        .text("inequality (GINI)")
                                        .attr("text-anchor", "middle"); 
                                // d3.select("#graph5")
                                //         .append("text")
                                //         .attr("class", "graphTitle")
                                //         .attr("x", graphWidth/2)
                                //         .attr("y", 20)
                                //         .text("poverty")
                                //         .attr("text-anchor", "middle"); 
                        
                        if(d['pri9195'] == "" && d['pri0610'] == ""){
                            
                            d3.select("#graph1")
                                        .append("text")
                                        .attr("class", "nodata")
                                        .text("No Data")
                                        .attr('x', graphWidth/2)
                                        .attr('y', graphWidth/2 + 5)
                                        .style("fill", "LightGrey")
                                        .attr("text-anchor", "middle");    
                        }
                        
                        if(d['sec9195'] == "" && d['sec0610'] == ""){
                             d3.select("#graph2")
                                        .append("text")
                                        .attr("class", "nodata")
                                        .text("No Data")
                                        .attr('x', graphWidth/2)
                                        .attr('y', graphWidth/2 + 5)
                                        .style("fill", "LightGrey")
                                        .attr("text-anchor", "middle");   
                        }
                        
                        if(d['ter9195'] == "" && d['ter0610'] == ""){
                             d3.select("#graph3")
                                        .append("text")
                                        .attr("class", "nodata")
                                        .text("No Data")
                                        .attr('x', graphWidth/2)
                                        .attr('y', graphWidth/2 + 5)
                                        .style("fill", "LightGrey")
                                        .attr("text-anchor", "middle");   
                        }
                        
                        if(d['gini9195'] == "" && d['gini0610'] == ""){
                             d3.select("#graph4")
                                        .append("text")
                                        .attr("class", "nodata")
                                        .text("No Data")
                                        .attr('x', graphWidth/2)
                                        .attr('y', graphWidth/2 + 5)
                                        .style("fill", "LightGrey")
                                        .attr("text-anchor", "middle");   
                        }
                        
                        if(d['pri9195'] !== "" && d['pri0610'] !== ""){  
                       
                        var line1 = d3.select("#graph1")
                                    .append("line")
                                    .attr("x1", graphWidth/8)
                                    .attr("y1", mapygraph1(d['pri9195']))
                                    .attr("x2", 7*(graphWidth/8))
                                    .attr("y2", mapygraph1(d['pri0610']))
                                    .attr('stroke', '#27bde2')
                                    .attr('stroke-width', 2);
                        }
                        
                        if(d['pri9195'] !== ""){
                        var circle1a = d3.select("#graph1")
                                        .append("circle")
                                        .attr("cx", graphWidth/8)
                                        .attr('cy', mapygraph1(d['pri9195']))
                                        .attr('r', 5)
                                        .attr('fill', '#27bde2')
                                        .attr('stroke', 'white')
                                        .attr('stroke-width', 2);
                        
                        var text1a = d3.select("#graph1")
                                        .append("text")
                                        .attr('class', 'label2')
                                        .text(d['pri9195'] + "%")
                                        .attr('x', graphWidth/8 - 15)
                                        .attr('y', mapygraph1(d['pri9195']) - 15);
                                        
                        }
                        
                        if(d['pri0610'] !== ""){
                        var circle1b = d3.select("#graph1")
                                        .append("circle")
                                        .attr("cx", 7*(graphWidth/8))
                                        .attr('cy', mapygraph1(d['pri0610']))
                                        .attr('r', 5)
                                        .attr('fill', '#27bde2')
                                        .attr('stroke', 'white')
                                        .attr('stroke-width', 2);
                                        
                        var text1b = d3.select("#graph1")
                                        .append("text")
                                        .attr('class', 'label2')
                                        .text(d['pri0610'] + "%")
                                        .attr('x', 7*(graphWidth/8) - 15)
                                        .attr('y', mapygraph1(d['pri0610']) - 15);
                                        
                        }            
                        
                        if(d['sec9195'] !== "" && d['sec0610'] !== ""){
                        var line2 = d3.select("#graph2")
                                    .append("line")
                                    .attr("x1", graphWidth/8)
                                    .attr("y1", mapygraph1(d['sec9195']))
                                    .attr("x2", 7*(graphWidth/8))
                                    .attr("y2", mapygraph1(d['sec0610']))
                                    .attr('stroke', '#27bde2')
                                    .attr('stroke-width', 2);            
                        }
                        
                        if(d['sec9195'] !== ""){
                        var circle2a = d3.select("#graph2")
                                        .append("circle")
                                        .attr("cx", graphWidth/8)
                                        .attr('cy', mapygraph1(d['sec9195']))
                                        .attr('r', 5)
                                        .attr('fill', '#27bde2')
                                        .attr('stroke', 'white')
                                        .attr('stroke-width', 2);
                        
                        var text2a = d3.select("#graph2")
                                        .append("text")
                                        .attr('class', 'label2')
                                        .text(d['sec9195'] + "%")
                                        .attr('x', (graphWidth/8) - 15)
                                        .attr('y', mapygraph1(d['sec9195']) - 15);                
                                        
                        }
                        
                        if(d['sec0610'] !== ""){
                        var circle2b = d3.select("#graph2")
                                        .append("circle")
                                        .attr("cx", 7*(graphWidth/8))
                                        .attr('cy', mapygraph1(d['sec0610']))
                                        .attr('r', 5)
                                        .attr('fill', '#27bde2')
                                        .attr('stroke', 'white')
                                        .attr('stroke-width', 2);
                        
                        var text2b = d3.select("#graph2")
                                        .append("text")
                                        .attr('class', 'label2')
                                        .text(d['sec0610'] + "%")
                                        .attr('x', 7*(graphWidth/8) - 15)
                                        .attr('y', mapygraph2(d['sec0610']) - 15);                   
                        }
                        
                        if(d['ter9195'] !== "" && d['ter0610'] !== ""){
                        var line3 = d3.select("#graph3")
                                    .append("line")
                                    .attr("x1", graphWidth/8)
                                    .attr("y1", mapygraph1(d['ter9195']))
                                    .attr("x2", 7*(graphWidth/8))
                                    .attr("y2", mapygraph1(d['ter0610']))
                                    .attr('stroke', '#27bde2')
                                    .attr('stroke-width', 2);
                        }
                        
                        if(d['ter9195'] !== ""){
                        var circle3a = d3.select("#graph3")
                                        .append("circle")
                                        .attr("cx", graphWidth/8)
                                        .attr('cy', mapygraph1(d['ter9195']))
                                        .attr('r', 5)
                                        .attr('fill', '#27bde2')
                                        .attr('stroke', 'white')
                                        .attr('stroke-width', 2);
                        
                        var text3a = d3.select("#graph3")
                                        .append("text")
                                        .attr('class', 'label2')
                                        .text(d['ter9195'] + "%")
                                        .attr('x', (graphWidth/8) - 15)
                                        .attr('y', mapygraph1(d['ter9195']) - 15);                     
                        
                                        
                        }
                        if(d['ter0610'] != ""){
                        var circle3b = d3.select("#graph3")
                                        .append("circle")
                                        .attr("cx", 7*(graphWidth/8))
                                        .attr('cy', mapygraph1(d['ter0610']))
                                        .attr('r', 5)
                                        .attr('fill', '#27bde2')
                                        .attr('stroke', 'white')
                                        .attr('stroke-width', 2);
                         
                        var text3b = d3.select("#graph3")
                                        .append("text")
                                        .attr('class', 'label2')
                                        .text(d['ter0610'] + "%")
                                        .attr('x', 7*(graphWidth/8) - 15)
                                        .attr('y', mapygraph1(d['ter0610']) - 15);                     
                        
                                        
                        }                
                                    
                        if(d['gini9195'] !== "" && d['gini0610'] !== ""){
                        var line3 = d3.select("#graph4")
                                    .append("line")
                                    .attr("x1", graphWidth/8)
                                    .attr("y1", mapygraph4(d['gini9195']))
                                    .attr("x2", 7*(graphWidth/8))
                                    .attr("y2", mapygraph4(d['gini0610']))
                                    .attr('stroke', '#fcc30b')
                                    .attr('stroke-width', 2);
                        }
                        
                        if(d['gini9195'] !== ""){
                        var circle4a = d3.select("#graph4")
                                        .append("circle")
                                        .attr("cx", graphWidth/8)
                                        .attr('cy', mapygraph4(d['gini9195']))
                                        .attr('r', 5)
                                        .attr('fill', '#fcc30b')
                                        .attr('stroke', 'white')
                                        .attr('stroke-width', 2);
                        
                        var text4a = d3.select("#graph4")
                                        .append("text")
                                        .attr('class', 'label2')
                                        .text(d['gini9195'] + "%")
                                        .attr('x', (graphWidth/8) - 15)
                                        .attr('y', mapygraph4(d['gini9195']) - 15);                   
                                        
                        }
                          
                        if(d['gini0610'] !== ""){                
                        var circle4b = d3.select("#graph4")
                                        .append("circle")
                                        .attr("cx", 7*(graphWidth/8))
                                        .attr('cy', mapygraph4(d['gini0610']))
                                        .attr('r', 5)
                                        .attr('fill', '#fcc30b')
                                        .attr('stroke', 'white')
                                        .attr('stroke-width', 2); 
                        var text4b = d3.select("#graph4")
                                        .append("text")
                                        .attr('class', 'label2')
                                        .text(d['gini0610'] + "%")
                                        .attr('x', 7*(graphWidth/8) - 15)
                                        .attr('y', mapygraph4(d['gini0610']) - 15);
                                        
                                        
                        }        
                                $(".btn.close").on("click",function(){
			                    	$("#myModal").fadeOut();
			                            })
                                        
                                $("#myModal").fadeIn(); })
                                     
 
                                // .on("mouseclick", function(){ alert(" HI "); })
                                .on("mouseover", function(d) 
                                    {
                                    d3.select(this).selectAll("circle").style("stroke", 'black').style("stroke-width", "2.5").style("fill-opacity", "1"); // d3.select(this).selectAll("#funnelLine").style("stroke-width", "2");
                                    d3.select(this).selectAll("line").style("stroke-width", "2.5").style("stroke-opacity", "1"); 
                                    d3.select(this).selectAll("rect").style("fill-opacity", "1"); 
                                    div.transition()		
                                        .duration(200)		
                                        .style("opacity", 1);
                                    
                                    var primColor, secColor, terColor;
                                    if(d['enrolPrimary'] >= 91.97){primColor = 'green';}else{ primColor = 'red'};
                                    if(d['enrolSecondary'] >= d['enrolSecondaryAvg']){secColor = 'green';}else{ secColor = 'red'};
                                    if(d['enrolTertiary'] >= 8.39){terColor = 'green';}else{ terColor = 'red'};
                                        
                                    div.html("<span style='font-size: 15px; text-align: left; text-transform: uppercase'>" + "<b>" + d['country'] + "</b> </span> <br>" 
                                                         // + "</span>" + "<br>" + "<span> <br> Primary:   </span>"+  "<b>"+ "<span style = 'color: " + primColor + "'>"  + d['enrolPrimary'] + "%" +  " </span> </b>"
                                                          + "<br>" + " Primary:  <b>" + "<span style='color: " + primColor + "'>" + d['enrolPrimary'] + "%" + "</span> </b>"
                                                          + "<br>" + " Secondary:  <b>" + "<span style='color: " + secColor + "'>" + d['enrolSecondary'] + "%" + "</span> </b>"
                                                          + "<br>" + " Tertiary: <b>" + "<span style='color: " + terColor + "'>" + d['enrolTertiary'] + "%" + "</span> </b>")	
                                        .style("left", (d3.event.pageX - 80) + "px")		
                                        .style("top", (d3.event.pageY - 130) + "px");
                                    })
                                .on("mouseout", function() {
                                    d3.select(this).selectAll("circle").style("stroke", 'white').style("stroke-width", "0").style("fill-opacity", "0.5");
                                    //d3.select(this).selectAll("#funnelLine").style("stroke-width", "0.3").style("stroke-opacity", "0").style("stroke", clr);
                                    d3.select(this).selectAll("line").style("stroke-width", "2").style("stroke-opacity", "0.2").style("stroke", clr);
                                    d3.select(this).selectAll("rect").style("fill-opacity", "0");
                                    
                                    
                                    div.transition()		
                                        .duration(500)		
                                        .style("opacity", 0);	
                                });
                                    
                
            }