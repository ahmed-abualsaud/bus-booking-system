let num = 0;
let map;
let service;
let behavior;
let ui;
let bubble;
let coord;
let content;

document.querySelector('#exampleModal').addEventListener('shown.bs.modal', function()
{
    if (num == 0) {
        initializeMap();
    }
    num++;
});

function initializeMap() {
    map = new H.Map(
      document.querySelector('.map'),
      mapTypes.vector.normal.map,
      {
      pixelRatio: window.devicePixelRatio || 1
    });
    service = platform.getSearchService();
    window.addEventListener('resize', () => map.getViewPort().resize());
    behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    ui = H.ui.UI.createDefault(map, mapTypes);
    if (bubble != null) {
        ui.removeBubble(bubble);
    }
    map.setCenter({ lat: 31.210255408774994, lng: 29.912237445076208});
    map.setZoom(10);
    addContextMenus(map);
}

function openMap(input) {
    window.addressType = input;
}

function addContextMenus(map) {
    map.addEventListener('contextmenu', function (e) {
        if (e.target !== map) {
          return;
        }
        if (bubble != null) {
            ui.removeBubble(bubble);
        }
        coord = map.screenToGeo(e.viewportX, e.viewportY);
        addInfoBubble(coord.lat, coord.lng);
    });
}

function getLocation() {
    if (bubble != null) {
        ui.removeBubble(bubble);
    }
    navigator.geolocation.getCurrentPosition(
        position => {
            window.lat = position.coords.latitude;
            window.lng = position.coords.longitude;
            map.setCenter({ lat: window.lat, lng: window.lng});
            map.setZoom(12);
            addInfoBubble(window.lat, window.lng);
        },
        error => {
            console.log(error);
        },
        {
            enableHighAccuracy: true
        }
    );
}

function addInfoBubble(lat, lng) {
    service.reverseGeocode({
      at: lat + ',' + lng
    }, (result) => {
      result.items.forEach((item) => {
        item.address.label = item.address.label.replace(/'/g, "\\\'");
        content = '<div style="width: 250px;"> <div class="py-2 text-danger">'+ 
        item.address.label + '</div><button onclick="writeAddress(' + window.addressType + 
        ', \'' + String(item.address.label) + '\', '  + lat + ', ' + lng + 
        ')" type="button" class="btn btn-primary">';

        if (window.addressType == 0) {
            content += 'Set As Departure Address</button></div>';
        } else {
            content += 'Set As Destination Address</button></div>';
        }

        bubble = new H.ui.InfoBubble(item.position, {
          content: content
        });
        ui.addBubble(bubble);
      });
    }, alert);
}


function writeAddress(input, address, lat, lng) {
    if (input == 0) {
        document.querySelector('#departure').value = address;
        document.querySelector('#dep_lat').value = lat;
        document.querySelector('#dep_lng').value = lng;
        alert('The Address is Set Successfully');
    } else if (input == 1) {
        document.querySelector('#destination').value = address;
        document.querySelector('#des_lat').value = lat;
        document.querySelector('#des_lng').value = lng;
        alert('The Address is Set Successfully');
    } else {
        alert('An Error Happened');
    }
}
