var margin = {top: 40, right: 20, bottom: 20, left: 40},
	width = 1300 - margin.left - margin.right,
	height = 700 - margin.top - margin.bottom;
	console.log(height)

var G = d3.select("#G")
var S = d3.select("#S")
//var E = d3.select("#E")
var landa = d3.select("#landa")
var eq = d3.select("#eq")


d3.queue()
	.defer(d3.csv,"data/combined.csv")
	.defer(d3.csv,"data/countrylists/groupcountries.csv")
	.await(analyze);

function analyze(error, data, cont){
	if(error)console.log(error)

	data.forEach(function(d){
		for(var i =0;i<cont.length;i++){
			if(d.Country_Name == cont[i].Country_Name){
				d.Continent = cont[i].Continent;
			}
		}
	})

	console.log(data)

	data.forEach(function(d){
		d.ag = +d.ag;
		d.agval = +d.agval;
		d.elec = +d.elec;
		d.food = +d.food;
		d.foreign = +d.foreign;
		d.gdpcap = +d.gdpcap;
		d.gini = +d.gini;
		d.gdpcap = +d.gdpcap;
		d.percity = +d.percity;
		//d.pop = +d.pop;
		d.slum = +d.slum;
		d.sqkm = +d.sqkm;
	})	

//var xscale = d3.scaleLinear().domain([0,50]).range([70,width+margin.right])
//var xscale = d3.scaleLinear().domain([0,1000000]).range([70,width+margin.right])
var xscale = d3.scaleLinear().domain(d3.extent(data, function(d){return d.food})).range([100,width-margin.right*2])

var yscale = d3.scaleLinear().domain(d3.extent(data, function(d){return d.slum})).range([height-70,45])
var giniscale = d3.scaleLinear().domain(d3.extent(data, function(d){return d.gini})).range([height-70,45])
//var yscale = d3.scaleLinear().domain([0,1585000000000]).range([height-50,45])
//var yscale = d3.scaleLinear().domain([0,55000]).range([height-50,45])
var rMax = d3.max(data, function(d){var an = Math.sqrt(d.ag/Math.PI);return an})
//console.log(Math.floor(rMax))
var rscale = d3.scaleLinear().domain(d3.extent(data, function(d){
	return d.ag})).range([30,10000])

var fullrMax = d3.max(data, function(d){var an = Math.sqrt(d.gdpcap/Math.PI);return an})
//console.log(Math.floor(fullrMax))
var fullrscale = d3.scaleLinear().domain(d3.extent(data, function(d){
	return d.gdpcap})).range([30,10000])

var poprscale = d3.scaleLinear().domain(d3.extent(data, function(d){
	return d.gdpcap})).range([30,10000])

var piescale = d3.scaleLinear().domain([0,100]).range([0,360])
var radscale = d3.scaleLinear().domain([0,360]).range([0-Math.PI/2,Math.PI/2+Math.PI])
//var cartxscale = 
//var cartyscale = d3.scaleLinear().domain(

var xAxis = d3.axisBottom(xscale)
	//.scale(x)
	//.orient("bottom");
var yAxis = d3.axisLeft(yscale)
var giniyAxis = d3.axisLeft(giniscale)
	//.scale(y)
	//.orient("left");

/*
^^^^^^^^^^^^^^^ SCALING and INIT ^^^^^^^^^^^^^^
vvvvvvvvvvvvvvv UI and TOOLTIPS vvvvvvvvvvvvvvvvv
*/
////svg canvas and boreder vv


	console.log(rscale(Math.sqrt(data.ag/Math.PI)))

	var div = d3.select("#fancy_chart").append("div")	
		.style("position","absolute")
		.attr("class", "tooltip")				
		.style("opacity", 0);


	var svg = d3.select("#fancy_chart").append("svg")
		.attr("width", width+margin.right*2)
		.attr("height", height)
		//.style("border", "0.5px dashed grey")
		.style("padding", "20px")
		//.style("background", "white")
		.style("background", "#0a97d9")
		//.style("background", "#fcc30b")
		//.style("background", "#a21942")
		.style("padding-bottom","0px")
		.style("margin-bottom","0px");



////LEGEND vvvvv

var legend = ["African Countries ","Non-African Countries "]
svg.append("text").attr("id","legendtext").selectAll("tspan")
	.data(legend)
	.enter().append("tspan")
	.attr("x", width+20)
	.attr("y", function(d,i){return 400 + 30*i})
	.attr("text-anchor","end")
	.attr("fill", "white")
	.text(function(d){return d})

svg.append("rect")
	.attr("x", width-170)
	.attr("y", 360)
	.attr("width", 200)
	.attr("height", 100)
	.attr("stroke", "white")
	.attr("stroke-width", 1)
	.attr("rx","1px")
	.attr("ry","1px")
	.attr("fill", "transparent")


svg.append("rect")
	.attr("x",width-160)
	.attr("y", 390)
	.attr("width",9)
	.attr("height",9)
	.attr("rx","1px")
	.attr("ry","1px")
		.style("opacity",0.75)
	.attr("fill", "#fcc30b")

svg.append("rect")
	.attr("x", width-160)
	.attr("y", 420)
	.attr("width",9)
	.attr("height",9)
	.attr("rx","1px")
	.attr("ry","1px")
		.style("opacity",0.75)
	.attr("fill", "#19486a")

////LEGEND vvvvv
////svg canvas and boreder ^^
	//console.log(height)
	
	svg.append("g")
		.attr("class", "x_axis")
		.attr("transform", "translate(0,580)")
		.style("fill", "white")
		.style("stroke", "white")
		.call(xAxis);

	svg.append("text")
		.attr("class", "xlabel")
		.attr("x",width/2)
		.attr("y",height -5)
		.attr("fill","white")
		.style("text-anchor","middle")
		.style("font-weight","regular")
		.style("font-size", "26px")
		.text("Food Imports (as % of Imported Merchandise)");
		//.text("Food Imports (as % of total merchandise imports)");

	svg.append("g")
		.attr("class", "y_axis")
		.attr("transform", "translate(70,0)")
		.style("fill", "white")
		.style("stroke", "white")
		.call(yAxis);

	svg.append("text")
		.attr("class", "ylabel")
		.attr("transform", "rotate(-90)")
		.attr("fill","white")
		.attr("x",-120)
		.attr("y",30)
		.style("text-anchor","end")
		.style("font-weight","regular")
		.style("font-size", "26px")
		.text("% of Urban Population Living in Slums");

////axes ^^^^

	var update = svg.selectAll("g")
		.data(data)
		.enter()
		.append('g');



	update.append("circle")
		//.attr("class", "countr")
		.attr("r",0)
		.attr("cx",function(d,i){return xscale(d.food)})
		.attr("cy", 0)
		.transition()
		.duration(2000)
		.delay(function(d,i){return i*6})
		.attr("r", function(d,i){
			if(d.food == 0){
				return 0
			}else{
			return 5//Math.sqrt(rscale(d.ag)/Math.PI)
			}		
		})
		.attr("cx",function(d,i){return xscale(d.food)})
		.attr("cy", function(d,i){return yscale(d.slum)})
		.style("fill", function(d){
			if(d.Continent == "Africa"){
				return "#fcc30b"
				//return "#fcc30b"
			}else{
				//return "#0A294E"
				return "#19486a"
			}
		})
		.style("stroke-width","0.5px")
		.style("stroke", "white")
		.style("opacity",0.75)

/*
vvvvvvvvvvvvvvv POINT SWELL ANIME vvvvvvvvvvvvvvvvvv
*/
		d3.selectAll("circle").on("mouseover", function(d){
			d3.select(this).transition()
		.duration(1000)
				.style("opacity",1.0)
				.style("stroke-width", "2px")
				.attr("r", function(d,i){//function(el){return Math.sqrt(rscale(el.ag)/Math.PI)+5});
					if(d.food == 0){
						return 0
					}else{
					return 6//Math.sqrt(rscale(d.ag)/Math.PI)
					}		
				})
			div.transition()
		.duration(1000)
				.style("color", "black")
				.style("opacity", 0.9);
			div.html(d.Country_Name)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})	

		d3.selectAll("circle").on("mouseout", function(){
			d3.select(this)
			.transition()
			.attr("r", function(d,i){
					if(d.food == 0){
						return 0
					}else{
					return 6//Math.sqrt(rscale(d.ag)/Math.PI)
					}		
				})

			div.transition()
				.duration(1000)
				.style("opacity", 0)
		})

/*
^^^^^^^^^^^^^^^ POINT SWELL ANIME ^^^^^^^^^^^^^^^
*/


		landa.on("click", function(){
			//d3.select(this).transition()
			update.selectAll("circle")
			//.attr("class", "landarea")
			.transition()
		.duration(1000)
		.delay(function(d,i){return i*6})
//		.style("stroke", function(d){
//			if(d.ag >50000){
//				return "#56c02b"
//			}})
//		.style("stroke-width",function(d){
//			if(d.ag >5000){return "2px"}
//				else{return "0.0px"}
//			})
		.attr("r", function(el){
				if(el.food == 0){
					return 0;
				}else{
					return Math.sqrt(rscale(el.ag)/Math.PI)
				}	
			})
			
		div.transition()
		.duration(1000)
			.style("opacity",0)
		});

		update.selectAll("circle").on("mouseout", function(){
			d3.select(this)
			.transition()

		})

/*
^^^^^^^^^^^^^^^ UI and TOOLTIPS ^^^^^^^^^^^^^^^
vvvvvvvvvvvvvvv INITIAL RENDER vvvvvvvvvvvvvvvvvv
*/
	S.on("mouseover",function(){S.style("background", "#00689d");})
	S.on("mouseout",function(){S.style("background", "#0a97d9");})

	G.on("mouseover",function(){G.style("background", "#00689d");})
	G.on("mouseout",function(){G.style("background", "#0a97d9");})

	eq.on("mouseover",function(){eq.style("background", "#00689d");})
	eq.on("mouseout",function(){eq.style("background", "#0a97d9");})

	landa.on("mouseover",function(){landa.style("background", "#00689d");})
	landa.on("mouseout",function(){landa.style("background", "#0a97d9");})


//**********

////////// Slum % button /////////vv

//**********


	S.on("click", function(){
	
		S.on("mouseover",function(){S.style("background", "#00689d");})
		S.on("mouseout",function(){S.style("background", "#0a97d9");})
	
		G.on("mouseover",function(){G.style("background", "#00689d");})
		G.on("mouseout",function(){G.style("background", "#0a97d9");})
	
		eq.on("mouseover",function(){eq.style("background", "#00689d");})
		eq.on("mouseout",function(){eq.style("background", "#0a97d9");})
	
		landa.on("mouseover",function(){landa.style("background", "#00689d");})
		landa.on("mouseout",function(){landa.style("background", "#0a97d9");})


	update.selectAll("circle")
		.transition()
		.duration(2000)
		.delay(function(d,i){return i*6})
		.attr("r", function(d,i){
			if(d.food == 0){
				return 0
			}else{
			return 5//Math.sqrt(rscale(d.ag)/Math.PI)
			}		
		})
		.attr("cx",function(d,i){return xscale(d.food)})
		.attr("cy", function(d,i){return yscale(d.slum)})
		.style("fill", function(d){
			if(d.Continent == "Africa"){
				return "#fcc30b"
				//return "#fcc30b"
			}else{
				//return "#0A294E"
				return "#19486a"
			}
		})
		.style("stroke-width","0.5px")
		.style("stroke", "white")
		.style("opacity",0.75)

/*
vvvvvvvvvvvvvvv POINT SWELL ANIME vvvvvvvvvvvvvvvvvv
*/
		d3.selectAll("circle").on("mouseover", function(d){
			d3.select(this).transition()
		.duration(1000)
				.style("opacity",1.0)
				.style("stroke-width", "2px")
				.attr("r", function(d,i){//function(el){return Math.sqrt(rscale(el.ag)/Math.PI)+5});
					if(d.food == 0){
						return 0
					}else{
					return 6//Math.sqrt(rscale(d.ag)/Math.PI)
					}		
				})
			div.transition()
		.duration(1000)
				.style("color", "black")
				.style("opacity", 0.9);
			div.html(d.Country_Name)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})	

		d3.selectAll("circle").on("mouseout", function(){
			d3.select(this)
			.transition()
			.attr("r", function(d,i){
					if(d.food == 0){
						return 0
					}else{
					return 6//Math.sqrt(rscale(d.ag)/Math.PI)
					}		
				})

			div.transition()
				.duration(1000)
				.style("opacity", 0)
		})

/*
^^^^^^^^^^^^^^^ POINT SWELL ANIME ^^^^^^^^^^^^^^^
*/


		landa.on("click", function(){
			//d3.select(this).transition()
			update.selectAll("circle")
			//.attr("class", "landarea")
			.transition()
		.duration(1000)
		.delay(function(d,i){return i*6})
//		.style("stroke", function(d){
//			if(d.ag >50000){
//				return "#56c02b"
//			}})
//		.style("stroke-width",function(d){
//			if(d.ag >5000){return "2px"}
//				else{return "0.0px"}
//			})
		.attr("r", function(el){
				if(el.food == 0){
					return 0;
				}else{
					return Math.sqrt(rscale(el.ag)/Math.PI)
				}	
			})
			
		div.transition()
		.duration(1000)
			.style("opacity",0)
		});

		update.selectAll(".landarea").on("mouseout", function(){
			d3.select(this)
			.transition()

		})

	})


	G.on("click",function(){
		
	
		S.on("mouseover",function(){S.style("background", "#00689d");})
		S.on("mouseout",function(){S.style("background", "#0a97d9");})
	
		G.on("mouseover",function(){G.style("background", "#00689d");})
		G.on("mouseout",function(){G.style("background", "#0a97d9");})
	
		eq.on("mouseover",function(){eq.style("background", "#00689d");})
		eq.on("mouseout",function(){eq.style("background", "#0a97d9");})
	
		landa.on("mouseover",function(){landa.style("background", "#00689d");})
		landa.on("mouseout",function(){landa.style("background", "#0a97d9");})


	update.selectAll("circle")
		.transition()
		.delay(function(d,i){return i*6})
		.duration(2000)
		.attr("r", function(d,i){
			if(d.food == 0){
				return 0
			}else{
			return 5//Math.sqrt(rscale(d.ag)/Math.PI)
			}		
		})
		.attr("cx",function(d,i){return xscale(d.food)})
		.attr("cy", function(d,i){return giniscale(d.gini)})
		.style("fill", function(d){
			if(d.Continent == "Africa"){
				return "#fcc30b"
				//return "#fcc30b"
			}else{
				//return "#0A294E"
				return "#19486a"
			}
		})
		.style("stroke-width","0.5px")
		.style("stroke", "white")
		.style("opacity",0.75)

/*
vvvvvvvvvvvvvvv POINT SWELL ANIME vvvvvvvvvvvvvvvvvv
*/
		d3.selectAll("circle").on("mouseover", function(d){
			d3.select(this).transition()
		.duration(1000)
				.style("opacity",1.0)
				.style("stroke-width", "2px")
				.attr("r", function(d,i){//function(el){return Math.sqrt(rscale(el.ag)/Math.PI)+5});
					if(d.food == 0){
						return 0
					}else{
					return 6//Math.sqrt(rscale(d.ag)/Math.PI)
					}		
				})
			div.transition()
		.duration(1000)
				.style("color", "black")
				.style("opacity", 0.9);
			div.html(d.Country_Name)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})	

		d3.selectAll("circle").on("mouseout", function(){
			d3.select(this)
			.transition()
			.attr("r", function(d,i){
					if(d.food == 0){
						return 0
					}else{
					return 6//Math.sqrt(rscale(d.ag)/Math.PI)
					}		
				})

			div.transition()
				.duration(1000)
				.style("opacity", 0)
		})

/*
^^^^^^^^^^^^^^^ POINT SWELL ANIME ^^^^^^^^^^^^^^^
*/


		landa.on("click", function(){
			//d3.select(this).transition()
			update.selectAll("circle")
			//.attr("class", "landarea")
			.transition()
		.duration(1000)
		.delay(function(d,i){return i*6})
//		.style("stroke", function(d){
//			if(d.ag >50000){
//				return "#56c02b"
//			}})
//		.style("stroke-width",function(d){
//			if(d.ag >5000){return "2px"}
//				else{return "0.0px"}
//			})
		.attr("r", function(el){
				if(el.food == 0){
					return 0;
				}else{
					return Math.sqrt(rscale(el.ag)/Math.PI)
				}	
			})
			
		div.transition()
		.duration(1000)
			.style("opacity",0)
		});

		update.selectAll(".landarea").on("mouseout", function(){
			d3.select(this)
			.transition()

		})

	})



eq.on("click",function(){
	update.selectAll("circle")
		.transition()
		.duration(1000)
		.attr("r", function(d,i){
			if(d.food == 0){
				return 0
			}else{
			return 5//Math.sqrt(rscale(d.ag)/Math.PI)
			}		
		})
})







		}
