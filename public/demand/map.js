var lat = 0;
var lng = 0;

/*Pusher.logToConsole = true;
var pusher = new Pusher('94792de974f2dbaa47e8', {
  cluster: 'eu',
  authEndpoint: 'http://localhost:5050/pusher/auth'
});*/

// set up containers for the map  + panel
var mapContainer = document.querySelector('.map'),
  routeInstructionsContainer = document.querySelector('.panel');

var closeButton = document.createElement('div');
closeButton.innerHTML = '<button type="button" class="close" data-dismiss="panel" ' +
'aria-label="Close"> <span aria-hidden="true">&times;</span></button>';
routeInstructionsContainer.appendChild(closeButton);

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

//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, mapTypes);

// Hold a reference to any infobubble opened
var bubble;

// Create an icon, an object holding the latitude and longitude, and a marker:
var icon = new H.map.Icon('http://localhost:8000/demand/marker.png');
// Create a marker using the previously instantiated icon:
var marker;
var route;
var routeRequestParams;
var router;
window.durations = [];
window.durationsBetweenStations = [];
window.totalDuration = 0;
window.goAhead = 0;
window.totalDurationArray = [];
//--------------------------------------------------------------------------------------------
window.onload =  getLocation ;

function getLocation() {
	navigator.geolocation.getCurrentPosition(
		position => {
			lat = 31.210255408774994;
			lng = 29.912237445076208;
			showMap();
		},
		error => {
			console.log(error);
		},
		{
			enableHighAccuracy: true
		}
	);
}

function showMap() {
	// Create a marker using the previously instantiated icon:
  marker = new H.map.Marker({ lat: lat, lng: lng }, { icon: icon });
	// Set map center and zoom, add the marker to the map:
	map.setCenter({ lat: lat, lng: lng});
	map.setZoom(12);
	map.addObject(marker);
  addContextMenus(map);
  bindBusConsumer(document.getElementById('bus').innerHTML.trim());
}

//--------------------------------------------------------------------------------------------
function searchSupply() {
	let stations = getFiveNearestStations();
	for (let i = 0; i < stations.length; i++) {
		calculateRouteFromAtoB(platform, {lat: lat, lng: lng}, stations[i], i);
	}

	let inval = setInterval(function(){
		if (window.durations.length == stations.length*2) {
			let durObj = getNearstLocation(window.durations);
      //pusherGate(document.getElementById('bus').innerHTML.trim());
			drawRouteFromAtoB(platform, stations[durObj.index]);
			openBubble(stations[durObj.index], '<span style="display: inline-block; width: 240px;">Travel Time= '+durObj.duration.toMMSS()+'</span>   '+
				'<button onclick="showInfoPanel()">Info</button');
      let busesInfo = getStationBusesInfo(stations[durObj.index].id);
      //fillWaitTimeArray(busesInfo, stations, durObj.index);
      /*let interval = setInterval(function(){
        if (window.totalDurationArray.length == Object.keys(busesInfo.locations).length) {
          console.log(window.totalDurationArray);
          clearInterval(interval);
        }
      }, 10);*/
      window.durations = [];
			clearInterval(inval);
		}
	}, 10);
}

function fillWaitTimeArray(busesInfo, stations, stationIndex) {
  for (let i = 0; i < busesInfo.buses.length; i++) {
    if (busesInfo.buses[i].number in busesInfo.locations) {
      window.durationsBetweenStations = [];
      let bus = busesInfo.buses[i].number;
      let busStations = getBusStations(busesInfo.buses[i].id);
      calculateBusRouteFromAtoB(platform, JSON.parse(busesInfo.locations[bus].trim()), 
       busStations[JSON.parse(busesInfo.locations[bus].trim()).index], 0);

      let interval = setInterval(function(){
        if (window.durationsBetweenStations.length == 1) {
          window.totalDuration = window.durationsBetweenStations[0].duration;
          window.durationsBetweenStations = [];
          durationBetweenEachTwoStations(JSON.parse(busesInfo.locations[bus].trim()), 
            busStations, stations[stationIndex]);
          let interval2 = setInterval(function(){
            if (window.goAhead == 1) {
              let elem = {};
              elem["number"] = bus;
              elem["duration"] = window.totalDuration;
              window.totalDurationArray.push(elem);
              console.log(window.totalDurationArray);
              window.goAhead = 0;
              clearInterval(interval2);
            }
          }, 10);
          clearInterval(interval);
        }
      }, 10);
    }
  }
}

function durationBetweenEachTwoStations(busInfo, busStations, currentStation) {
  let stationIndex = getStationIndex(busStations, currentStation);
  for (let i = 0; i < busStations.length - 1; i++) {
    calculateBusRouteFromAtoB(platform, busStations[i], busStations[i+1], i);
  }

  let interval = setInterval(function(){
    if (window.durationsBetweenStations.length == busStations.length-1) {
      if (stationIndex != -1 && busInfo.index <= stationIndex) {
        for (let i = busInfo.index; i < stationIndex; i++) {
          window.totalDuration += window.durationsBetweenStations[i].duration;
        }
      } else {
        if (stationIndex != -1) {
          for (let i = busInfo.index; i < window.durationsBetweenStations.length; i++) {
            window.totalDuration += window.durationsBetweenStations[i].duration;
          }
          for (let i = window.durationsBetweenStations.length - 1; i >= stationIndex; i--) {
            window.totalDuration += window.durationsBetweenStations[i].duration;
          }
        }
      }
      window.goAhead = 1;
      clearInterval(interval);
    }
  }, 10);
  
}

function getStationIndex(stations, station) {
  for (var i = 0; i < stations.length; i++) {
    if (stations[i].id == station.id){
      return i;
    }
  }
  return -1;
}

function showInfoPanel() {
	routeInstructionsContainer.classList.toggle('panel');
	routeInstructionsContainer.classList.toggle('panel-show');
}

function getNearstLocation(durations) {
	let smallestDurationIndex = durations[0];
	let smallestDuration = durations[1];
	for(let i = 3; i < durations.length; i+=2) {
		if(durations[i] < smallestDuration) {
			smallestDuration = durations[i];
			smallestDurationIndex = durations[i-1];
		}
	}
	let durObj = JSON.parse('{"index": '+smallestDurationIndex+',"duration": '+smallestDuration+'}');
	return durObj;
}

function getBusStations(busID) {
  let stationsString;
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "http://localhost:8000/getBusStations", false);
  xhttp.setRequestHeader("X-CSRF-TOKEN", getCSRFToken("_token"));
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      stationsString = this.responseText;
    }
  };
  xhttp.send('id=' + busID);
  return JSON.parse(stationsString);
}

function getStationBusesInfo(stationID) {
  let busesString;
  let locationsString;
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "http://localhost:8000/getStationBuses", false);
  xhttp.setRequestHeader("X-CSRF-TOKEN", getCSRFToken("_token"));
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      busesString = this.responseText;
    }
  };
  xhttp.send('id=' + stationID);
  //--------------------------------------------------------------------------  
  xhttp.open("POST", "http://localhost:5050/getStationBusesLocations", false);
  //xhttp.setRequestHeader("X-CSRF-TOKEN", getCSRFToken("_token"));
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      locationsString = this.responseText;
    }
  };
  xhttp.send('buses=' + busesString);
  return {locations: JSON.parse(locationsString), buses: JSON.parse(busesString)};
}

function getFiveNearestStations() {
  let stationsString;
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "http://localhost:8000/getFiveNearestStations", false);
  xhttp.setRequestHeader("X-CSRF-TOKEN", getCSRFToken("_token"));
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      stationsString = this.responseText;
    }
  };
  xhttp.send("lat=" + lat + "&lng=" + lng);
  let stations = JSON.parse(stationsString);
  return stations;
}

function calculateBusRouteFromAtoB (platform, start, end, index) {
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
      window.durationsBetweenStations.push(elem);
    }, onError);
}

function calculateRouteFromAtoB (platform, start, end, index) {
    router = platform.getRoutingService(null, 8);
    routeRequestParams = {
        routingMode: 'fast',
        transportMode: 'pedestrian',
        origin: start.lat + ',' + start.lng, 
        destination: end.lat + ',' + end.lng,  
        return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
      };
  router.calculateRoute(
    routeRequestParams, (result) => {
    	route = result.routes[0];
    	window.durations.push(index);
    	window.durations.push(calculateDuration(route));
    }, onError);
}

function drawRouteFromAtoB (platform, station) {
    router = platform.getRoutingService(null, 8);
    routeRequestParams = {
        routingMode: 'fast',
        transportMode: 'pedestrian',
        origin: lat + ',' + lng, 
        destination: station.lat + ',' + station.lng,  
        return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
      };
	router.calculateRoute(
	    routeRequestParams, (result) => {
	    	route = result.routes[0];
			addRouteShapeToMap(route);
			addManueversToMap(route);
			addWaypointsToPanel(route);
			addManueversToPanel(route);
			addSummaryToPanel(route);
	}, onError);
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
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


/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route){
  route.sections.forEach((section) => {
    // decode LineString from the flexible polyline
    let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

    // Create a polyline to display the route:
    let polyline = new H.map.Polyline(linestring, {
      style: {
        lineWidth: 4,
        strokeColor: 'rgba(0, 128, 255, 0.7)'
      }
    });

    // Add the polyline to the map
    map.addObject(polyline);
    // And zoom to its bounding rectangle
    map.getViewModel().setLookAtData({
      bounds: polyline.getBoundingBox()
    });
  });
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToMap(route){
  var svgMarkup = '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
      'fill="#1b468d" stroke="white" stroke-width="1"  />' +
    '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),
    group = new  H.map.Group(),
    i,
    j;
  route.sections.forEach((section) => {
    let poly = H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray();
    let actions = section.actions;
    // Add a marker for each maneuver
    for (i = 0;  i < actions.length; i += 1) {
      let action = actions[i];
      var marker =  new H.map.Marker({
        lat: poly[action.offset * 3],
        lng: poly[action.offset * 3 + 1]},
        {icon: dotIcon});
      marker.instruction = action.instruction;
      group.addObject(marker);
    }

    group.addEventListener('tap', function (evt) {
      map.setCenter(evt.target.getGeometry());
      openBubble(
         evt.target.getGeometry(), evt.target.instruction);
    }, false);

    // Add the maneuvers group to the map
    map.addObject(group);
  });
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addWaypointsToPanel(route) {
  var nodeH3 = document.createElement('h3'),
      labels = [];

  route.sections.forEach((section) => {
    labels.push(
      section.turnByTurnActions[0].nextRoad.name[0].value)
    labels.push(
      section.turnByTurnActions[section.turnByTurnActions.length - 1].currentRoad.name[0].value)
  });
  
  nodeH3.textContent = labels.join(' - ');
  routeInstructionsContainer.innerHTML = '';
  routeInstructionsContainer.appendChild(nodeH3);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addSummaryToPanel(route){
  let duration = 0,
      distance = 0;

  route.sections.forEach((section) => {
    distance += section.travelSummary.length;
    duration += section.travelSummary.duration;
  });

  var summaryDiv = document.createElement('div'),
   content = '';
   content += '<b>Total distance</b>: ' + distance  + 'm. <br/>';
   content += '<b>Travel Time</b>: ' + duration.toMMSS() + ' (in current traffic)';


  summaryDiv.style.fontSize = 'small';
  summaryDiv.style.marginLeft ='5%';
  summaryDiv.style.marginRight ='5%';
  summaryDiv.innerHTML = content;
  routeInstructionsContainer.appendChild(summaryDiv);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToPanel(route){
  var nodeOL = document.createElement('ol');

  nodeOL.style.fontSize = 'small';
  nodeOL.style.marginLeft ='5%';
  nodeOL.style.marginRight ='5%';
  nodeOL.className = 'directions';

  route.sections.forEach((section) => {
    section.actions.forEach((action, idx) => {
      var li = document.createElement('li'),
          spanArrow = document.createElement('span'),
          spanInstruction = document.createElement('span');

      spanArrow.className = 'arrow ' + (action.direction || '') + action.action;
      spanInstruction.innerHTML = section.actions[idx].instruction;
      li.appendChild(spanArrow);
      li.appendChild(spanInstruction);

      nodeOL.appendChild(li);
    });
  });

  routeInstructionsContainer.appendChild(nodeOL);
}


Number.prototype.toMMSS = function () {
  return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
}

function calculateDuration(route) {

	let duration = 0;

	route.sections.forEach((section) => {
		duration += section.travelSummary.duration;
	});
	return duration;	
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

function bindBusConsumer(topicName) {
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "http://localhost:5050/kafkaConsumeStreamAPI", true);
  //xhttp.setRequestHeader("X-CSRF-TOKEN", getCSRFToken("_token"));
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.onreadystatechange = function() {
      if (this.readyState != 4 && this.status != 200) {
        document.querySelector(".ret").innerHTML += this.responseText;
      }      
  };
  xhttp.send('topicName=' + topicName);
}

/*function pusherGate(channelName) {
    var channel = pusher.subscribe('private-' + channelName);
    channel.bind('SendLocation', function(data) {
      console.log(data);
    });
}*/
//--------------------------------------------------------------------------------------------