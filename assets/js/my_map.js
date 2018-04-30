/**
 * Created by Shivendra on 05/04/18.
 */

"use strict";

var local_base_url = "http://127.0.0.1:5000/";
var aws_base_url = "http://a0789c979482c11e89703062872d6ca9-501906506.us-west-2.elb.amazonaws.com/";
var base_url = local_base_url;

var topic_counts_data;
var trend_classification;
var sentiment_counts_data;
var trend_sentiment;

//Function to plot sentiment bar chart
function sentiment_bar_chart(sentiment_counts_data) {
    var keys = Object.keys(sentiment_counts_data);
    keys.sort();
    var values = [];
    for (var i = 0; i < keys.length; i++) {
        values.push(sentiment_counts_data[keys[i]]);
    }

    var data = [{
        type: 'bar',
        x: values,
        y: keys,
        marker:{
            color:['E8CD5E','AAAAAA','FF6800','FF0000','3386FF','FFA5F9','36FF5D','56EAFF']
        },
        orientation: 'h'
    }];

    Plotly.newPlot('sentiment_bar_chart', data);
}


//Function to plot topic bar chart
function bar_chart(topic_counts_data) {
    var keys = Object.keys(topic_counts_data);
    keys.sort();
    var values = [];
    for (var i = 0; i < keys.length; i++) {
        values.push(topic_counts_data[keys[i]]);
    }

    var data = [{
        type: 'bar',
        x: values,
        y: keys,
        marker:{
        color:['E8CD5E','AAAAAA','FF6800','FF0000','3386FF','FFA5F9','36FF5D','56EAFF']
        },
        orientation: 'h'
    }];

    Plotly.newPlot('barChart', data);
}


//Function to display trend topic badges
function trend_badge(trend_classification, topic_counts_data){
		var topics = Object.keys(topic_counts_data);
    	topics.sort();
		var dict = {
			"Business": "#Business",
			"Entertainment": "#Entertainment",
			"Event": "#Event",
			"Health": "#Health",
			"News": "#News",
			"Politics": "#Politics",
			"Sports": "#Sports",
			"Technology": "#Technology"
		};

		for( var i = 0; i<topics.length; i++){
			var count = 0;

			$.each(trend_classification, function(key, val){
				// This function will called for each key-val pair.
				// You can do anything here with them.
				if (val == topics[i]){
					$(dict[topics[i]]).append('<span class="badge badge-warning">'+key+'</span>');
					count++;
				}
				if(count >= 10){
					return false;
				}
			});
		}

		$("#Health").append('<span class="badge badge-warning">Check</span>');
}


//Ajax call to get all markers
$(document).ready(function(e) {

    $.ajax({
        type: "GET",

        url: base_url + "all_markers",

        success: function(result) {
            var data = result.geo_json;
            topic_counts_data = result.topic_counts;
            trend_classification = result.trend_classification;
            sentiment_counts_data = result.sentiment_counts;
            trend_sentiment = result.trend_sentiment;

            console.log('Call successful');

            //Rendering the bar chart for the 1st tab
            bar_chart(topic_counts_data);

			//Rendering the 2nd tab (trend badge tab)
			trend_badge(trend_classification, topic_counts_data);

            //Rendering the sentiment bar chart for the 3rd tab
            sentiment_bar_chart(sentiment_counts_data);


            //Ready to go, load the geojson
            geojson = data;
            metadata = data.properties;
            var markers = L.geoJson(geojson, {
                pointToLayer: defineFeature,
                onEachFeature: defineFeaturePopup
            });
            markerclusters.addLayer(markers);
            map.fitBounds(markers.getBounds());
            map.attributionControl.addAttribution(metadata.attribution);
            map.setZoom(3);
            // renderLegend();

            $("#loader_page").hide();

        },
        error: function(result) {
            console.log("Something went wrong");
        }
    });
});


//Initializing the map
var geojson,
    metadata,
    // geojsonPath = 'traffic_accidents.geojson',
    categoryField = '5074', //This is the fieldname for marker category (used in the pie and legend)
    iconField = '5074', //This is the fieldname for marker icon
    popupFields = ['5056','5055','5074', '5065', '5057', '5059'], //Popup will display these fields
//    tileServer = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    tileServer = 'https://api.mapbox.com/styles/v1/shayonx/cjgd7zco500012sqyk222aswn/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hheW9ueCIsImEiOiJjamdkN2V2OGwzc3BuMnduNXhiem9kYWI4In0.ii_AbJ51VHqD302XDaS2kQ',
    tileAttribution = 'Map data: <a href="http://openstreetmap.org">OSM</a>',
    rmax = 30, //Maximum radius for cluster pies
    markerclusters = L.markerClusterGroup({
        maxClusterRadius: 2*rmax,
        iconCreateFunction: defineClusterIcon //this is where the magic happens
    }),
    map = L.map('mapid').setView([40.0150, -105.2705], 8);

//Add basemap
L.tileLayer(tileServer, {
    attribution: tileAttribution,
    maxZoom: 15,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoibGVhZmxldC10cmlhbCIsImEiOiJjajB0NDh2cW8wNWE1MzJvNWNrZGpiYnFkIn0.QeSfbOpNFdR_u4SyQSzl4A'
}).addTo(map);

//and the empty markercluster layer
map.addLayer(markerclusters);

//Adding the sidebar to map
var sidebar = L.control.sidebar('sidebar').addTo(map);

function defineFeature(feature, latlng) {
    var categoryVal = feature.properties[categoryField],
        iconVal = feature.properties[iconField];
    var myClass = 'marker category-'+categoryVal+' icon-'+iconVal;
    var myIcon = L.divIcon({
        className: myClass,
        iconSize:null
    });
    // console.log("Test");
    return L.marker(latlng, {icon: myIcon});
}

function defineFeaturePopup(feature, layer) {
    var props = feature.properties,
        fields = metadata.fields,
        popupContent = '';

    popupFields.map( function(key) {
        if (props[key]) {
            var val = props[key],
                label = fields[key].name;
            if (label == 'Tweet'){
                val = val + '</br></br>';
            }
            if (fields[key].lookup) {
                val = fields[key].lookup[val];
            }
            popupContent += '<span class="attribute"><span class="my_label">'+label+':</span> '+val+'</span>';
        }
    });
    popupContent = '<div class="map-popup">'+popupContent+'</div>';
    layer.bindPopup(popupContent,{offset: L.point(1,-2)});
}

function defineClusterIcon(cluster) {
    var children = cluster.getAllChildMarkers(),
        n = children.length, //Get number of markers in cluster
        strokeWidth = 1, //Set clusterpie stroke width
        r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0), //Calculate clusterpie radius...
        iconDim = (r+strokeWidth)*2, //...and divIcon dimensions (leaflet really want to know the size)
        data = d3v5.nest() //Build a dataset for the pie chart
            .key(function(d) { return d.feature.properties[categoryField]; })
            .entries(children, d3v5.map),
    //bake some svg markup
        html = bakeThePie({data: data,
            valueFunc: function(d){return d.values.length;},
            strokeWidth: 1,
            outerRadius: r,
            innerRadius: r-10,
            pieClass: 'cluster-pie',
            pieLabel: n,
            pieLabelClass: 'marker-cluster-pie-label',
            pathClassFunc: function(d){return "category-"+d.data.key;},
            pathTitleFunc: function(d){return metadata.fields[categoryField].lookup[d.data.key]+' ('+d.data.values.length+' accident'+(d.data.values.length!=1?'s':'')+')';}
        }),
    //Create a new divIcon and assign the svg markup to the html property
        myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster',
            iconSize: new L.Point(iconDim, iconDim)
        });
    return myIcon;
}

/*function that generates a svg markup for the pie chart*/
function bakeThePie(options) {
    /*data and valueFunc are required*/
    if (!options.data || !options.valueFunc) {
        return '';
    }
    var data = options.data,
        valueFunc = options.valueFunc,
        r = options.outerRadius?options.outerRadius:28, //Default outer radius = 28px
        rInner = options.innerRadius?options.innerRadius:r-10, //Default inner radius = r-10
        strokeWidth = options.strokeWidth?options.strokeWidth:1, //Default stroke is 1
        pathClassFunc = options.pathClassFunc?options.pathClassFunc:function(){return '';}, //Class for each path
        pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:function(){return '';}, //Title for each path
        pieClass = options.pieClass?options.pieClass:'marker-cluster-pie', //Class for the whole pie
        pieLabel = options.pieLabel?options.pieLabel:d3v5.sum(data,valueFunc), //Label for the whole pie
        pieLabelClass = options.pieLabelClass?options.pieLabelClass:'marker-cluster-pie-label',//Class for the pie label

        origo = (r+strokeWidth), //Center coordinate
        w = origo*2, //width and height of the svg element
        h = w,
        donut = d3v5.pie(),
        arc = d3v5.arc().innerRadius(rInner).outerRadius(r);


    //Create an svg element
    var svg = document.createElementNS(d3v5.namespaces.svg, 'svg');
    //Create the pie chart
    var vis = d3v5.select(svg)
        .data([data])
        .attr('class', pieClass)
        .attr('width', w)
        .attr('height', h);

    var arcs = vis.selectAll('g.arc')
        .data(donut.value(valueFunc))
        .enter().append('svg:g')
        .attr('class', 'arc')
        .attr('transform', 'translate(' + origo + ',' + origo + ')');

    arcs.append('svg:path')
        .attr('class', pathClassFunc)
        .attr('stroke-width', strokeWidth)
        .attr('d', arc)
        .append('svg:title')
        .text(pathTitleFunc);

    vis.append('text')  // .attr("css", { color: "white" })
        .style("fill", 'white')
		.attr('x',origo)
        .attr('y',origo)
        .attr('class', pieLabelClass)
        .attr('text-anchor', 'middle')
        //.attr('dominant-baseline', 'central')
        /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
        .attr('dy','.3em')
        .text(pieLabel);
    //Return the svg-markup rather than the actual element
    return serializeXmlNode(svg);
}

/*Function for generating a legend with the same categories as in the clusterPie*/
function renderLegend() {
    var data = d3v5.entries(metadata.fields[categoryField].lookup),
        legenddiv = d3v5.select('body').append('div')
            .attr('id','legend');
    console.log(data);

    var heading = legenddiv.append('div')
        .classed('legendheading', true)
        .text(metadata.fields[categoryField].name);

    var legenditems = legenddiv.selectAll('.legenditem')
        .data(data);
    console.log(legenditems);

    legenditems.enter().append('div').attr('class', function(f){return 'category-'+f.key;})
        .classed('legenditem', true).text(function(f){return f.value;});
}

/*Helper function*/
function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}


//Ajax call to get trend graph
$(document).ready(function(e) {

    $.ajax({
        type: "GET",
        url: base_url + "trend_graph",

        success: function(result) {
            var graph = result;

                var width = 960,
                    height = 500;

                var color = d3v3.scale.category20();

                var force = d3v3.layout.force()
                    .linkDistance(200)
                    .charge(-1000)
                    .size([width, height]);


                var svg = d3v3.select("#messages").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("align", "left");



                    force
                        .nodes(graph.nodes)
                        .links(graph.links)
                        .start();

                    var link = svg.selectAll(".link")
                        .data(graph.links)
                        .enter().append("line")
                        .attr("class", "link")
                        .style("stroke-width", function(d) { return 0.5; });

                    var node = svg.selectAll(".node")
                        .data(graph.nodes)
                        .enter().append("circle")
                        .attr("class", "node")
                        .attr("r", 7)
                        .call(force.drag);

                    node.append("title")
                        .text(function(d) { return d.name; });

                    var texts  = svg.selectAll(".texts")
                        .data(graph.nodes)
                        .enter()
                        .append("text")
                        .attr("dx", 12)
                        .attr("dy", "0.35em")
                        .text(function(d){ return d.name; });
                    //      .call(force.drag);
                    //      .attr("font-size", function(d){ return d.influence*1.5>9? d.influence*1.5: 9; })


                    force.on("tick", function() {
                        link.attr("x1", function(d) { return d.source.x; })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; });

                        node.attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; });

                        texts.attr("x", function(d) { return d.x; })
                            .attr("y", function(d) { return d.y; });
                    });

                    d3v3.select("#clusterButton").on("click", function () {
                        netClustering.cluster(graph.nodes, graph.links);

                        svg.selectAll(".node").transition().duration(500).style("fill", function(d) { return color(d.cluster); });
                    });

                $( "#cluster_tab" ).click(function() {
                    console.log("cluster_tab  Clicked");
                    $("#sidebar").css("width", "900px");
                });
            $( "#collapse" ).click(function() {
                console.log("Collapse Clicked");
                $("#sidebar").css("width", "");
            });

        },
        error: function(result) {
            console.log("Something went wrong");
        }
    });
});

