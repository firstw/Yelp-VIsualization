var color = d3.scaleOrdinal()
		.domain(["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"])
		.range(["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"]);
	
// Create map
var map = L.map('map').setView([33.42,-111.92], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmlyc3R3IiwiYSI6ImNqZGhtenk1OTBlbWMyeG82Z285ajI2d3gifQ.P_sNnF9UTWzmPhFccfvTHw', {
attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © 		<a href="http://mapbox.com">Mapbox</a>',
maxZoom: 18,
id: 'mapbox.streets'
}).addTo(map);

map._initPathRoot(); 

var svg = d3.select("#map").select("svg"),
g = svg.append("g");

// Load data and plot it on map
var datafile = "tempe_restaurants_real_final.json"; 
d3.json(datafile, function(data){
	data.forEach(function(d) {
		try{
			d.LatLng = new L.LatLng(d.latitude,d.longitude);
		} catch(err) {
			console.log('error', d.LatLng, err)
		}
		
	})

	feature = g.selectAll("circle")
		.data(data)
		.enter().append("circle")
		.style("stroke", "red")  
		.style("opacity", .6) 
		.style("fill", function(d){return color(d.stars)})
		.attr("r", 5)
		.on("click", function(d) {	view_restaurant(d);	}) 
	

	// create a d3.geoPath to convert GeoJSON to SVG
	transform = d3.geoTransform({point: projectPoint});
 	path = d3.geoPath().projection(transform);

	map.on("viewreset", update);
	update();

})

function update() {
	currentZoom = map.getZoom();
	
	// reposotion dots
	feature.attr("transform", 
		function(d) { 
			return "translate("+ 
				map.latLngToLayerPoint(d.LatLng).x +","+ 
				map.latLngToLayerPoint(d.LatLng).y +")";
	})
}

// Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
	var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	this.stream.point(point.x, point.y);
}

// show info when hover
function show_info(data) {

	console.log("hover");	
	
	d3.select("#rightpanel")
        .style("width", +200 + "px")
        .style("height", +400 + "px")
        .style("padding", +20+ "px")
        .style("right", -20 + 10 + "px");
	
	d3.select("#rightpanel").transition().duration(200)
                    .style("right", +0 + "px");
}

function hide_info(data) {
	console.log("mouse out");
	d3.select("#rightpanel").transition().duration(200)
                    .style("left", +0 + "px");
}

// draw rate chart and word cloud when click
function view_restaurant(data) {
	
	//---------------------------------------draw word cloud----------------------------------------------------
	// change raw data to the format that is usable for word cloud
	var words = data["keyword"];
	var cloud_length;
	var cloud_data = []
	
	if(words.length > 30) {
		cloud_length = 30;
	}
	else {
		cloud_length = words.length;
	}
	
	// TODO: random put data
	for(i=0; i<cloud_length; i++) {
		cloud_data.push({"text":words[i]})
	}

	d3.select("#wordcloud svg").remove();

	var wc_margin = {top: 5, right: 5, bottom: 5, left: 5};
	var wc_width = 760 - wc_margin.left - wc_margin.right;
	var wc_height = 350 - wc_margin.top - wc_margin.bottom;

	var cloud_g = d3.select("#wordcloud").append("svg")
			.attr("width", wc_width)
			.attr("height", wc_height)
			.append("g")
			.attr("transform", "translate(" + wc_margin.left + "," + wc_margin.top + ")");
	
	var color = d3.scaleOrdinal(d3.schemeCategory20);
	var fontSize = d3.scalePow().exponent(5).domain([0,1]).range([20,60]);
	  
	var layout = d3.layout.cloud()
		  .size([wc_width, wc_height])
		  .timeInterval(10)
		  .words(cloud_data)
		  .rotate(function(d) { return 0; })
		  .fontSize(function(d,i) { return fontSize(Math.random()); })
		  .fontWeight(["bold"])
		  .text(function(d) { return d.text; })
		  .spiral("rectangular") // "archimedean" or "rectangular"
		  .on("end", draw)
		  .start();

   var wordcloud = cloud_g.append("g")
	  .attr('class','wordcloud')
	  .attr("transform", "translate(" + wc_width/2 + "," + wc_height/2 + ")");
			  
   cloud_g.append("g")
	  .attr("class", "axis")
	  .attr("transform", "translate(0," + wc_height + ")")
	  .selectAll('text')
	  .style('font-size','20px')
	  .style('fill',function(d) { return color(d); })
	  .style('font','sans-serif');

	function draw(words) {
		wordcloud.selectAll("text")
			.data(words)
			.enter().append("text")
			.attr('class','word')
			.style("fill", function(d, i) { return color(i); })
			.style("font-size", function(d) { return d.size + "px"; })
			.style("font-family", function(d) { return d.font; })
			.attr("text-anchor", "middle")
			.attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
			.text(function(d) { return d.text; });
	};
	//---------------------------------------draw word cloud end----------------------------------------------------
	
	//---------------------------------------draw rate chart----------------------------------------------------        
    var padding = 30;
    var rateChartX=10;
    var rateChartY=10;
    var border = 1;
    var bordercolor = 'black';
    
    var rc_margin = {top: 10, right: 10, bottom: 10, left: 10};
	var rc_width = 460 - rc_margin.left - rc_margin.right;
	var rc_height = 350 - rc_margin.top - rc_margin.bottom;
    
    var s1=data["stars_1"], s2=data["stars_2"],s3=data["stars_3"],s4=data["stars_4"],s5=data["stars_5"];
    	
//    	console.log([s1,s2,s3,s4,s5]);    	
	star = [{"rate": s1}, {"rate": s2}, {"rate": s3}, {"rate": s4}, {"rate": s5}];
	stars = [1, 1, 1, 1, 1];
    stars_label = ["1 star", "2 star", "3 star", "4 star", "5 star"];
    
    
    
        
    d3.select("#detail svg").remove();    
    
    var detail_svg = d3.select("#detail")
    				.append("svg")
    				.attr("width", 550)
					.attr("height", 350)
					.attr("transform", "translate( " + rateChartX + " , " + rateChartY + " )");  
	
	 x = d3.scaleLinear()
            .domain([0, data.review_count]).range([0, rc_width]);

     y = d3.scaleBand()
        .domain(star.map(function (d, i) {
            return i;
        }))
        .range([rc_height, 0], .1);
    
    rg = d3.select("#detail svg").append("g").attr("id", "ratechart");
    
    rg.append("line").attr("transform", "translate( " + rateChartX + " , " + rateChartY + " )")
            .attr("x1", padding)
            .attr("y1", 0)
            .attr("x2", padding)
            .attr("y2", y.bandwidth() * 5)
            .style("stroke", "black")
            .style("stoke-width", 1);
    
	background = rg.append("g")
            .attr("transform", "translate( " + rateChartX + " , " + rateChartY + " )");
    
    background.selectAll(".label").data(stars_label).enter()
            .append("text").attr("class", "label")
            .text(function (d) {
                return d;
            })
            .attr("x", padding / 7)
            .attr("y", function (d, i) {
            	// bandwidth is the width of the bar
            	// i is nth element in data
                return i * y.bandwidth() + y.bandwidth()/2 ;
            })
            .style("text-anchor", "middle")
            .style("stroke-width", 0.5)
            .style("stroke", "black")
            .style("font-size", "10px")
            .style("font-family", title_font_family);
   
	background.selectAll(".rect_background")
            .data(stars)
            .enter()
            .append("rect")
            .attr("class", "rect_background")
            .attr("x", padding)
            .attr("y", function (d, i) {
                return i * y.bandwidth() ;
            })
            .attr("width", x(data["review_count"]))
            .attr("height", y.bandwidth() - 2)
            .style("fill", "grey")
            .style("opacity", 0.1)
            .style("stroke", bordercolor)
            .style("stroke-width", border)
            .style("stroke-style", "inset");
   
    r_bar = rg.append("g")
            .attr("transform", "translate( " + rateChartX + " , " + rateChartY + " )");

    r_bar = r_bar.selectAll("rect").data(star);

        r_bar.transition().duration(200)
            .attr("width", function (d) {
                return x(d["rate"]);
            })
    
    r_bar.enter().append("rect")
            .attr("class", "review_bar")
            .attr("x", padding)
            .attr("y", function (d, i) {
                return i * y.bandwidth();
            })
            .attr("width", function (d) {
                return x(d.rate);
            })
            .attr("height", y.bandwidth())
            .style("fill", "lightblue")
            .style("stroke", bordercolor)
            .style("stroke-width", 1)
            .style("stroke-style", "outset")
    
    // precision
    p = d3.format(",.2%");

    r_bar.enter().append("text")
        .attr("class", "review_bar_text")
        .attr("x", x(data.review_count) + 35)
        .attr("y", function (d, i) {
            return i * y.bandwidth() + y.bandwidth() / 2;
        })
        .text(function (d) {
            return p(d.rate / data.review_count);
        })
        .style("text-anchor", "start")
        .style("font-size", "10px")
        .style("stroke-width", 0.5)
        .style("stroke", "black")
        .style("font-family", title_font_family);
    
    
    	
	//---------------------------------------draw rate chart end----------------------------------------------------
	
	//---------------------------------------draw info---------------------------------------------------- 
	var rate_star = { 1: "★", 2: "★★", 3: "★★★", 4: "★★★★", 5: "★★★★★",
        1.5: "★☆", 2.5: "★★☆", 3.5: "★★★☆", 4.5: "★★★★☆" };
    var price_range = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$"};
    var title_font_size = "20px";
    var title_font_family = "Bree Serif";
    var info_font_size = "15px;"
	
	var infoX = 5;
	var infoY = 5;
	
	var shift=20;
	
	//console.log(typeof(d3.select("#info").style("width")))
	
	svg_width = parseInt(d3.select("#info").style("width")) - 30;
	
	//console.log(svg_width)
	
	d3.select("#info svg").remove(); 
	var info_svg = d3.select("#info")
    				.append("svg")
    				.attr("width", svg_width)
					.attr("height", 350);
	
	ig = d3.select("#info svg").append("g");
	
	ig.attr("transform", "translate( " + infoX + " , " + shift + " )")
		.append("text")
        .attr("class", "name")
        .style("font-size", title_font_size)
        .style("font-family", title_font_family)
        .text(data["name"])
        ;
	
	d3.select("#info svg").append("g")
		.attr("transform", "translate( " + infoX + " , " + shift*2 + " )")
		.append("text")
        .attr("class", "name")
        .text("Rate: " + rate_star[data["stars"]]);
	
//	console.log(data);
//	console.log(data["attributes"]["RestaurantsPriceRange2"]);
	
	var price = data["attributes"]["RestaurantsPriceRange2"] == undefined ? "" : price_range[parseInt(data["attributes"]["RestaurantsPriceRange2"])];
	
	d3.select("#info svg").append("g")
		.attr("transform", "translate( " + infoX + " , " + shift*3 + " )")
		.append("text")
        .attr("class", "name")
        .text("Price: " + price);
	
	d3.select("#info svg").append("g")
		.attr("transform", "translate( " + infoX + " , " + shift*4 + " )")
		.append("text")
        .attr("class", "name")
       	.text("Reviews: " + data["review_count"] + "\n");
	
	d3.select("#info svg").append("g")
		.attr("transform", "translate( " + infoX + " , " + shift*5 + " )")
		.append("text")
        .attr("class", "name")
       	.text("Address: " + data["address"] + "\n");
	
	var cat = data["categories"];
	cat.sort(function(a, b){
  		return a.length - b.length;
	});
//	console.log(cat);
	
	var category_data = []
	var category_length;
	if(cat.length > 4) {
		category_length = 4;
	}
	else {
		category_length = cat.length;
	}
	
	var category_width=0;
	for(i=0; i<category_length; i++) {
		category_data.push(cat[i]);
		category_width += cat[i].length;
	}	
//	console.log(category_width);
	
	if(category_width>40) category_data.pop();
	
//	console.log(category_data);	
	var category_string = category_data.join(", ");
	//console.log(category_string);
	
	d3.select("#info svg").append("g")
		.attr("transform", "translate( " + infoX + " , " + shift*6 + " )")
		.append("text")
        .attr("class", "name")
        .text("Category: " + category_string);
       	       	
////    console.log(data["hours"]["Tuesday"]);
	var Monday_hour = data["hours"]["Monday"] == undefined ? "" : data["hours"]["Monday"];
	var Tuesday_hour = data["hours"]["Tuesday"] == undefined ? "" : data["hours"]["Tuesday"];
	var Wednesday_hour = data["hours"]["Wednesday"] == undefined ? "" : data["hours"]["Wednesday"];
	var Thursday_hour = data["hours"]["Thursday"] == undefined ? "" : data["hours"]["Thursday"];
	var Friday_hour = data["hours"]["Friday"] == undefined ? "" : data["hours"]["Friday"];
	var Saturday_hour = data["hours"]["Saturday"] == undefined ? "" : data["hours"]["Saturday"];
	var Sunday_hour = data["hours"]["Sunday"] == undefined ? "" : data["hours"]["Sunday"];
	
	d3.select("#info svg").append("g")
	.attr("transform", "translate( " + infoX + " , " + shift*7 + " )")
	.append("text")
    .attr("class", "name")
   	.text("Hours:");
	
	d3.select("#info svg").append("g")
	.attr("transform", "translate( " + infoX + " , " + shift*8 + " )")
	.append("text")
    .attr("class", "name")
   	.text("MON \u00A0" + Monday_hour);
   	
   	d3.select("#info svg").append("g")
	.attr("transform", "translate( " + infoX + " , " + shift*9 + " )")
	.append("text")
    .attr("class", "name")
   	.text("TUE \u00A0 \u00A0" + Tuesday_hour);
   	
   	d3.select("#info svg").append("g")
	.attr("transform", "translate( " + infoX + " , " + shift*10 + " )")
	.append("text")
    .attr("class", "name")
   	.text("WED \u00A0" + Wednesday_hour);
   	
   	d3.select("#info svg").append("g")
	.attr("transform", "translate( " + infoX + " , " + shift*11 + " )")
	.append("text")
    .attr("class", "name")
   	.text("THU \u00A0" + Thursday_hour);
   	
   	d3.select("#info svg").append("g")
	.attr("transform", "translate( " + infoX + " , " + shift*12 + " )")
	.append("text")
    .attr("class", "name")
   	.text("FRI \u00A0 \u00A0" + Friday_hour);
   	
   	d3.select("#info svg").append("g")
	.attr("transform", "translate( " + infoX + " , " + shift*13 + " )")
	.append("text")
    .attr("class", "name")
   	.text("SAT \u00A0" + Saturday_hour);
   	
   	d3.select("#info svg").append("g")
	.attr("transform", "translate( " + infoX + " , " + shift*14 + " )")
	.append("text")
    .attr("class", "name")
   	.text("SUN \u00A0" + Sunday_hour);
		
	//---------------------------------------draw info end----------------------------------------------------
		
}

