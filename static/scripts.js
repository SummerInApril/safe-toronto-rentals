
// Google Map
let map;
var counter=0;
// Google Heatmap Layer
var heatmap;

// Markers for map (homicide)
let markers = [];

// Info window
let info = new google.maps.InfoWindow();

var heatenable = new Boolean(false);
let opacityenable = false;

//Data to use for heatmap
var heatMapData= [];

//Empty array to use when toggle with heatmap
let empty=[];
    var displayHomicideMarker=true;
//Array of markers stored for kijiji marker
var markerKijiji=[];
var infoKijiji=[];
var kijijiItem = {
    title:"",
    link:"",
    descriptions:"",
    pubDate:"",
    price:null,
    lat:null,
    lng:null
};
var pointArray = new google.maps.MVCArray(empty);


// Execute when the DOM is fully loaded
$(document).ready(function() {


    // Options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    let options = {
        center: {lat: 43.6590996, lng: -79.3821182}, // Toronto
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 20,
        panControl: true,
        zoom: 13,
        zoomControl: true
    };

    // Get DOM node in which map will be instantiated
    let canvas = $("#map-canvas").get(0);

    // Instantiate map
    map = new google.maps.Map(canvas, options);
    heatmap = new google.maps.visualization.HeatmapLayer({
        radius:50
    });


    // Configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);
    heatmap.setMap(map);
    displayKijiji();

});



// Add marker for place to map
function addMarker(place)
{
    var myLatLng ={
    lat:place.lat,
    lng:place.long
    };

    getPoints(place.lat,place.long);

    var marker = new google.maps.Marker({
    position: myLatLng,
    animation: google.maps.Animation.DROP,
    map:map
    });

    //marker.addListener('click',toggleBounce);
    markers.push(marker);
}


function getPoints(lat,lng)
{
    var point = new google.maps.LatLng(lat,lng);
    heatMapData.push(point);
}


//Bounce Marker
 function toggleBounce()
{
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
}
// Configure application
function configure()
{

    // Configure typeahead
    $("#q").typeahead({
        highlight: false,
        minLength: 1
    },
    {

        display: function(suggestion) { return null; },
        limit: 10,
        source: search,
        templates: {
            suggestion: Handlebars.compile(
                "<div>" +

                    "{{ year }}, {{ division }}, {{ homicide_type }}" +
                "</div>"
            )
        }
    });

    // Re-center map after place is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

        // Set map's center
        map.setCenter({lat: parseFloat(suggestion.latitude), lng: parseFloat(suggestion.longitude)});

        // Update UI
        //update();
    });

    // Hide info window when text box has focus
    $("#q").focus(function(eventData) {
        info.close();
    });

    // Re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true;
        event.stopPropagation && event.stopPropagation();
        event.cancelBubble && event.cancelBubble();
    }, true);

    // Update UI
    update();
    // Give focus to text box
    $("#q").focus();



}
   // $("toggleHeatmap").click(function(){

         //heatmap.setMap(heatmap.getMap() ? null : map);
        //heatmap.setMap(map);
       // heatmap.setMap(map);
    //end if
   // });
function toggle(){
       if(heatenable==true){
        heatmap.setData(pointArray);
        heatenable=false;
        }
       else{
       heatmap.setData(heatMapData);
       heatenable=true;
       }
       console.log(heatenable);
}

// Remove markers from map
function removeMarkers()
{
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
    markers=[];
}
function year()
{

    var select = document.getElementById("selectyear");
    var selectyear = Number(select.value)+2003;
    let parameters = {q: selectyear};
    heatMapData.length=0;

    heatmap.setData(pointArray);
    removeMarkers();
    $.getJSON("/search",parameters,function(data){
           for (let i = 0; i < data.length; i++)
       {
           addMarker(data[i]);
       }
      if (heatenable==true){
      heatmap.setData(heatMapData);
      }
    });


}

// Search database for typeahead's suggestions
function search(query, syncResults, asyncResults)
{
    // Get places matching query (asynchronously)
    let parameters = {
        q: query
    };
    $.getJSON("/search", parameters, function(data, textStatus, jqXHR) {

        // Call typeahead's callback with search results (i.e., places)
        asyncResults(data);
    });
}



// Show info window at marker with content
function showInfo(marker, content)
{
    // Start div
    let div = "<div id='info'>";
    if (typeof(content) == "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='/static/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }

    // End div
    div += "</div>";

    // Set info window's content
    info.setContent(div);

    // Open info window (if not already open)
    info.open(map, marker);
}


// Update UI's markers
function update()
{
    // Get map's bounds
    let bounds = map.getBounds();
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();

    // Get places within bounds (asynchronously)
    let parameters = {
        ne: `${ne.lat()},${ne.lng()}`,
        q: $("#q").val(),
        sw: `${sw.lat()},${sw.lng()}`
    };
    $.getJSON("/update", parameters, function(data, textStatus, jqXHR) {

       // Remove old markers from map
       removeMarkers();

       // Add new markers to map
       for (let i = 0; i < data.length; i++)
       {
           addMarker(data[i]);
       }

    });
}
function displayKijiji()
{

    for (let i = 1; i < 30; i++)
    {
       getKijiji(i);
       console.log(infoKijiji.length);
    }

}

function displayHomicide()
{
if (displayHomicideMarker==true){
    for (let i =0; i<markers.length;i++)
    {
        markers[i].setMap(null);
    }
    displayHomicideMarker=false;
}
else if (displayHomicideMarker==false){
        for (let i =0; i<markers.length;i++)
    {
        markers[i].setMap(map);
    }
    displayHomicideMarker=true;
}
}

//Credit: http://stackoverflow.com/questions/10943544/how-to-parse-an-rss-feed-using-javascript
function getKijiji(pageNum)
{
var first = "https://www.kijiji.ca/rss-srp-apartments-condos/city-of-toronto/page-";
var middle = pageNum.toString();
var last = "/c37l1700273";
var kijiji=first+middle+last;


	$.ajax(kijiji, {
		accepts:{
			xml:"application/rss+xml"
		},
		dataType:"xml",
		success:function(data) {


			$(data).find("item").each(function () { // or "item" or whatever suits your feed
				var el = $(this);

				kijijiItem.title=el.find("title").text();
				kijijiItem.link=el.find("link").text();
				kijijiItem.descriptions=el.find("description").text();
				kijijiItem.pubDate=el.find("pubDate").text();
				kijijiItem.price=el.find("g-core\\:price").text();
				kijijiItem.lat=el.find("geo\\:lat").text();
				kijijiItem.lng=el.find("geo\\:long").text();
				//console.log(kijijiItem.lng);
			    var mytime=setTimeout(addMarkerKijiji(kijijiItem),200);

                infoKijiji.push(kijijiItem);

			});


		}
	});
}
function addMarkerKijiji(kijijiItem)
{
    var kijijiShow;
    var kijijiLatLng= {
        lat:Number(kijijiItem.lat),
        lng:Number(kijijiItem.lng)
    };
    //console.log(kijijiLatLng);
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var markerK = new google.maps.Marker({
    position: kijijiLatLng,
    //animation: google.maps.Animation.DROP,
    zIndex:1000+counter,
    map:map,
    label: labels[3 % labels.length],
    icon:"http://maps.google.com/mapfiles/ms/icons/blue-pushpin.png"
    });
    counter=counter+1;
    markerKijiji.push(markerK);

    kijijiShow="<a href="+kijijiItem.link+">"+kijijiItem.title+"</a>"+"<p>Description: "+kijijiItem.descriptions+"</p><p>Price is: $"+kijijiItem.price+"</p>"+"<p>Published on: "+kijijiItem.pubDate+"</p>"
    markerK.addListener('click', function() {
      showInfo(markerK,kijijiShow);
        });



}

