/**
 * Created by shivendra on 05/04/18.
 */


//Initializing the map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibGVhZmxldC10cmlhbCIsImEiOiJjajB0NDh2cW8wNWE1MzJvNWNrZGpiYnFkIn0.QeSfbOpNFdR_u4SyQSzl4A'
}).addTo(mymap);





