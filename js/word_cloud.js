var margin = {top: 5, right: 5, bottom: 5, left: 5};
var width = 760 - margin.left - margin.right;
var height = 350 - margin.top - margin.bottom;

var cloud_g = d3.select("#detail").append("svg")
		.attr("width", width)
		.attr("height", height)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("Team_Info.csv",function(data){

//console.log(data);

var color = d3.scaleOrdinal(d3.schemeCategory20);
var categories = d3.keys(d3.nest().key(function(d) { return d.State; }).map(data));
var fontSize = d3.scalePow().exponent(5).domain([0,1]).range([20,60]);
var fontStyle = d3.scaleLinear().domain([categories]).range(['楷体','仿宋']);
  
var layout = d3.layout.cloud()
	  .size([width, height])
	  .timeInterval(20)
	  .words(data)
	  .rotate(function(d) { return 0; })
	  .fontSize(function(d,i) { return fontSize(Math.random()); })
	  //.fontStyle(function(d,i) { return fontSyle(Math.random()); })
	  .fontWeight(["bold"])
	  .text(function(d) { return d.Team_CN; })
	  .spiral("rectangular") // "archimedean" or "rectangular"
	  .on("end", draw)
	  .start();

   var wordcloud = cloud_g.append("g")
	  .attr('class','wordcloud')
	  .attr("transform", "translate(" + width/2 + "," + height/2 + ")");
	  
   cloud_g.append("g")
	  .attr("class", "axis")
	  .attr("transform", "translate(0," + height + ")")
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
	    //.style("fill", function(d) { 
	        //var paringObject = data.filter(function(obj) { return obj.Team_CN === d.text});
	       // return color(paringObject[0].category); 
	    //})
	    .attr("text-anchor", "middle")
	    .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
	    .text(function(d) { return d.text; });
};
  
});
