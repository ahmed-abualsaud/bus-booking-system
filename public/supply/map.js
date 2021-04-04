var locations = [];
locations["b112"] = {lat:31.210255408774994 ,lng:29.912237445076208};
locations["b222"] = {lat:31.2098762525227720 ,lng:29.8820517212799004};

var lat = locations[document.getElementById('bus').innerHTML.trim()].lat;
var lng = locations[document.getElementById('bus').innerHTML.trim()].lng;
var topicName= document.getElementById('bus').innerHTML.trim();
var msg;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyCS9x6sRudDypik6wbR1lfDPUz54PChUqM",
    authDomain: "busbooking-305718.firebaseapp.com",
    databaseURL: "https://busbooking-305718-default-rtdb.firebaseio.com",
    projectId: "busbooking-305718",
    storageBucket: "busbooking-305718.appspot.com",
    messagingSenderId: "543342574209",
    appId: "1:543342574209:web:7166a6ab894ce4fe2c2b80",
    measurementId: "G-QVHYE9KFM5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var index = 0;

/*Pusher.logToConsole = true;
var pusher = new Pusher('94792de974f2dbaa47e8', {
  cluster: 'eu',
  authEndpoint: 'http://localhost:5050/pusher/auth'
});
var channel = pusher.subscribe('private-SendLocation');
*/
// set up containers for the map  + panel
var mapContainer = document.querySelector('.map');

// Initialize the platform object:
	var platform = new H.service.Platform({
	'apikey': 'IORnJm8kR6jqxu3zd3swknYC7AXnbPWnGSpGTDN99F4'
});

// Obtain the default map types from the platform object:
var mapTypes = platform.createDefaultLayers();

// Instantiate (and display) a map object:
var map = new H.Map(
    document.querySelector('.map'),
    mapTypes.vector.normal.map,
    {
	  pixelRatio: window.devicePixelRatio || 1
	});
// add a resize listener to make sure that the map occupies the whole container
window.addEventListener('resize', () => map.getViewPort().resize());

// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, mapTypes);

// Hold a reference to any infobubble opened
var bubble;
// Define a variable holding SVG mark-up that defines an animated icon image:
var svgMarker =
    '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
      'fill="#1b468d" stroke="white" stroke-width="1"/>' +
    '</svg>';

// Create an icon object, an object with geographic coordinates and a marker:
var icon = new H.map.DomIcon(svgMarker);
// Create a marker for the start point:
var startMarker;
var marker;
var marker2
var route;
var routeRequestParams;
var router;
var routeOutline;
var routeArrows;
var routeLine;
window.durations = [];
window.goAhead = 0;
window.testData = [];
window.test = [];
window.tripDurations = [];
//--------------------------------------------------------------------------------------------
window.onload =  getLocation ;
var count = 0;
function getLocation() {
  let stations = getStations(document.getElementById('bus').innerHTML.trim());
  addContextMenus(map);
  initislizeMap(stations);
  //------------------------------------------------------
  //use for test only
  fillTestData(platform, {lat: lat, lng: lng}, stations[0]);
  for (let i = 0; i < stations.length - 1; i++) {
    let interval0 = setInterval(function() {
      if (window.goAhead == 1) {
        window.goAhead = 0;
        fillTestData(platform, stations[i], stations[i+1]);
        clearInterval(interval0);
      }
    }, 10);
  }
  //------------------------------------------------------

  let interval = setInterval(function(){
    if(window.testData.length == stations.length) {
      window.goAhead = 0;
      // convert 2D array to 1D array 
      for (let i = 0; i < window.testData.length; i++) {
        window.test = window.test.concat(window.testData[i]);
      }
      window.durations = [];
      calculateDurationFromAtoB(platform, {lat: lat, lng: lng}, stations[0], 0);
      let interval2 = setInterval(function(){
        if (window.durations.length == 1) {
          window.previousDuration = window.durations[0].duration;
          track(stations);
          clearInterval(interval2);
        }
      }, 10);
      clearInterval(interval);
    }
  }, 10);
}

function sendLocationDataToFirebase(lat, lng) {
    firebase.database().ref('locations/' + index).set({
        lat: lat,
        lng: lng
    });
    index++;
}

function initislizeMap(stations) {
  addContextMenus(map);
  map.setCenter({ lat: lat, lng: lng});
  map.setZoom(12);
  for (let i = 0; i < stations.length - 1; i++) {
    drawRouteFromAtoB(platform, stations[i], stations[i+1]);
  }
  startMarker = new H.map.Marker({lat: lat, lng: lng});
  map.addObject(startMarker);
  window.nextStationIndex = 0;
}

function track(stations) {
  let interval;
  navigator.geolocation.watchPosition(
    position => {
      if(count*3 < window.test.length) {
        lat = window.test[(count*3)];
        lng = window.test[(count*3 + 1)];
        count++;
      }
      //lat = position.coords.latitude;
      //lng = position.coords.longitude;
      //produceToKafka();
      //------------------------------------------------------------------------
      window.durations = [];
      calculateDurationFromAtoB(platform, {lat: lat, lng: lng}, stations[window.nextStationIndex], 0);
      interval = setInterval(function(){
        if (window.durations.length == 1) {
          if (window.durations[0].duration < 1) {
            if (window.nextStationIndex < stations.length - 1) {
              window.nextStationIndex++;
            }else {
              window.nextStationIndex--;
            }
          }

          if (window.durations[0].duration < window.previousDuration) {
            window.previousDuration = window.durations[0].duration;
          }

          if (window.previousDuration > (window.durations[0].duration + 20)) {
            window.tripDurations = [];
            calculateTripDurations(stations);
            let inval = setInterval(function(){
              if (window.tripDurations == stations.length) {
                window.nextStationIndex = window.tripDurations[0].index;
                clearInterval(inval);
              }
            }, 10);
          }
          map.setCenter({ lat: lat, lng: lng});
          map.removeObject(startMarker);
          startMarker = new H.map.Marker({lat: lat, lng: lng});
          map.addObject(startMarker);
          sendLocationDataToFirebase(lat, lng);
          clearInterval(interval);
        }
      }, 10);
      //-----------------------------------------------------------------
    },onError,
    {
      enableHighAccuracy: true,
    }
  );
}
function fillTestData(platform, start, end) {
  router = platform.getRoutingService(null, 8);
    routeRequestParams = {
        routingMode: 'fast',
        transportMode: 'bus',
        origin: start.lat + ',' + start.lng, 
        destination: end.lat + ',' + end.lng,  
        return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
      };
  router.calculateRoute(
      routeRequestParams, (result) => {
        let section = result.routes[0].sections[0];
        window.testData.push(H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray());
        window.goAhead = 1;
  }, onError);
}

//--------------------------------------------------------------------------------------------
function calculateTripDurations(stations) {
  window.durations = [];
  for (let i = 0; i < stations.length; i++) {
    calculateDurationFromAtoB(platform, {lat: lat, lng: lng}, stations[i], i);
  }
  let interval = setInterval(function(){
    if (window.durations.length == stations.length) {
      window.durations.sort((a,b) => {
        return a.duration - b.duration;
      });
      window.tripDurations = window.durations;
      //window.nextStationIndex = window.durations[0].index;
      clearInterval(interval);
    }
  }, 10);
}

function calculateDurationFromAtoB(platform, start, end, index) {
  router = platform.getRoutingService(null, 8);
    routeRequestParams = {
        routingMode: 'fast',
        transportMode: 'bus',
        origin: start.lat + ',' + start.lng, 
        destination: end.lat + ',' + end.lng,  
        return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
      };
  router.calculateRoute(
      routeRequestParams, (result) => {
        let elem = {};
        elem["index"] = index;
        elem["duration"] = calculateDuration(result.routes[0]);
        window.durations.push(elem);
  }, onError);
}

function calculateDuration(route) {

  let duration = 0;

  route.sections.forEach((section) => {
    duration += section.travelSummary.duration;
  });
  return duration;  
}

function drawRouteFromAtoB (platform, start, end) {
    router = platform.getRoutingService(null, 8);
    routeRequestParams = {
        routingMode: 'fast',
        transportMode: 'bus',
        origin: start.lat + ',' + start.lng, 
        destination: end.lat + ',' + end.lng,  
        return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
      };
	router.calculateRoute(routeRequestParams,
    (result) => {
      draw(result);
  }, onError);
}

function draw(result) {
  let linestring;
  // ensure that at least one route was found
  if (result.routes.length) {
    result.routes[0].sections.forEach((section) => {
      let poly = H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray();
      // Create a linestring to use as a point source for the route line
      linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
      // create a group that represents the route line and contains
      // outline and the pattern
      routeLine = new H.map.Group();
      //Within the onResult callback:
      // Create an outline for the route polyline:
      routeOutline = new H.map.Polyline(linestring, {
        style: {
          lineWidth: 10,
          strokeColor: 'rgba(0, 128, 255, 0.7)',
          lineTailCap: 'arrow-tail',
          lineHeadCap: 'arrow-head'
        }
      });
      // Create a patterned polyline:
      routeArrows = new H.map.Polyline(linestring, {
        style: {
          lineWidth: 10,
          fillColor: 'white',
          strokeColor: 'rgba(255, 255, 255, 1)',
          lineDash: [0, 2],
          lineTailCap: 'arrow-tail',
          lineHeadCap: 'arrow-head' }
        }
      );
      routeLine.addObjects([routeOutline, routeArrows]);
      marker = new H.map.DomMarker(section.arrival.place.location, { icon: icon })
      marker2 = new H.map.DomMarker(section.departure.place.location, {icon, icon});
      map.addObjects([routeLine, marker, marker2]);
    });
  }
};

function onError(error) {
  document.querySelector(".ret").innerHTML = "Can't reach the remote server";
}

function openBubble(position, text){
 if(!bubble){
    bubble =  new H.ui.InfoBubble(
      position,
      // The FO property holds the province name.
      {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}

Number.prototype.toMMSS = function () {
  return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
}

function getStations(busNumber) {
  let stationsString;
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "http://localhost:8000/getStations", false);
  xhttp.setRequestHeader("X-CSRF-TOKEN", getCSRFToken("_token"));
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      stationsString = this.responseText;
    }
  };
  xhttp.send("number=" + busNumber);
  let stations = JSON.parse(stationsString);
  return stations;
}

function getCSRFToken(metaName) {
  const metas = document.getElementsByTagName('meta');
  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute('name') === metaName) {
      return metas[i].getAttribute('content');
    }
  }
  return '';
}

function addContextMenus(map) {
  // First we need to subscribe to the "contextmenu" event on the map
  map.addEventListener('contextmenu', function (e) {
    // As we already handle contextmenu event callback on circle object,
    // we don't do anything if target is different than the map.
    if (e.target !== map) {
      return;
    }
    // Get geo coordinates from the screen coordinates.
    var coord  = map.screenToGeo(e.viewportX, e.viewportY);
    e.items.push(
      // Create a menu item, that has only a label,
      // which displays the current coordinates.
      new H.util.ContextItem({
        label: [
          'lat: ' + coord.lat.toFixed(16),
          ' ,lng: ' + coord.lng.toFixed(16)
        ].join(' ')
      }),
      // Create an item, that will change the map center when clicking on it.
      new H.util.ContextItem({
        label: 'Center map here',
        callback: function() {
          map.setCenter(coord, true);
        }
      }),
      // It is possible to add a seperator between items in order to logically group them.
      H.util.ContextItem.SEPARATOR,
      // This menu item will add a new circle to the map
      new H.util.ContextItem({
        label: 'Add circle',
        callback: addCircle.bind(map, coord)
      })
    );
  });
}

function addCircle(coord) {
  // Create a new circle object
  var circle = new H.map.Circle(coord, 5000), map = this;
  // Subscribe to the "contextmenu" eventas we did for the map.
  circle.addEventListener('contextmenu', function(e) {
    e.items.push(
      new H.util.ContextItem({
        label: 'Remove',
        callback: function() {
          map.removeObject(circle);
        }
      })
    );
  });
  // Make the circle visible, by adding it to the map
  map.addObject(circle);
}

/*function produceToKafka() {
    msg = {
      lat: lat,
      lng: lng,
      topicName: topicName,
      nextStationIndex: window.nextStationIndex
    };
    channel.trigger( 'client-SendLocation', msg);
}*/