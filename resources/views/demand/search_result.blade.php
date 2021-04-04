@extends('layout.main')

@section('style')
@endsection

@section('content')

<div class="ret"></div>

@endsection

@section('script')
<script type="text/javascript">

let router = platform.getRoutingService(null, 8);
let tripLines = {!! json_encode($tripLines) !!};
let searchInfo = {!! json_encode($searchInfo) !!};
window.departure = [];
window.destination = [];
window.userRoutes = [];

console.log(tripLines);
console.log(searchInfo);
tripLines.forEach((line) => {
    calculateRouteFromAtoB(platform, searchInfo.departure, line.departure, 0);
    calculateRouteFromAtoB(platform, line.destination, searchInfo.destination, 1);
});
let interval = setInterval(function(){
    if (window.departure.length == tripLines.length && 
        window.destination.length == tripLines.length) {
        for (let i = 0; i < tripLines.length; i++) {
            let dep = window.departure.find(el => el.name == 
                tripLines[i].departure.station_name);
            let des = window.destination.find(el => el.name == 
                tripLines[i].destination.station_name);
            let bestBus = getTheBestBus(tripLines[i].buses, dep.duration, "07:00:00");
            if (bestBus != null) {
                let elem = {};
                elem["departure"] = tripLines[i].departure;
                elem["destination"] = tripLines[i].destination;
                elem["to_dep"] = dep.duration;
                elem["to_des"] = des.duration;
                elem["bus"] = bestBus;
                window.userRoutes.push(elem);
            }
        }
        delete tripLines, window.departure, window.destination;
        window.userRoutes.sort((a, b) => (
            (a.to_dep + a.to_des + a.bus.trip + a.bus.wait) > (b.to_dep + b.to_des + b.bus.trip + b.bus.wait)) ? 1 : -1);
        for (let i = 0; i < window.userRoutes.length; i++) {
            createCard(window.userRoutes[i], searchInfo, i);
        }
        console.log(window.userRoutes);
        clearInterval(interval);
    }
}, 10);
//---------------------------------------------------------------------------------------------
function getTheBestBus(buses, dep_duration, current_time) {
    if (buses.departure.length == 0 || buses.destination.length == 0) {
        return null;
    }
    let durations = [];
    let userDepartureArrivalTime = timeToSeconds(current_time) + dep_duration;
    let busDepartureArrivalTime = 0;
    let busDestination;
    let tripDuration;
    buses.departure.forEach((bus) => {
        busDepartureArrivalTime = timeToSeconds(bus.pivot.arrival_time);
        if (userDepartureArrivalTime < busDepartureArrivalTime) {
            busDestination = buses.destination.find(el => el.id == bus.id);
            tripDuration = timeToSeconds(busDestination.pivot.arrival_time) - busDepartureArrivalTime;
            if (tripDuration > 0) {
                let elem = {};
                elem["number"] = bus.number;
                elem["dep_time"] = bus.pivot.arrival_time;
                elem["des_time"] = busDestination.pivot.arrival_time;
                elem["wait"] = busDepartureArrivalTime - userDepartureArrivalTime;
                elem["trip"] = tripDuration;
                durations.push(elem);
            }
        }
    });
    if (durations.length != 0) {
        durations.sort((a, b) => ((a.wait + a.trip) > (b.wait + b.trip)) ? 1 : -1);
        return durations[0];
    }
    return null;
}

function timeToSeconds(time) {
    let temp = time.split(':');
    if (temp.length == 3 || (temp.length == 4 && (temp[3] == "AM" || temp[3] == "am"))) {
        return (+temp[0])*60*60 + (+temp[1])*60 + (+temp[2]);
    }
    if(temp.length == 4 && (temp[3] == "PM" || temp[3] == "pm")) {
        return (+temp[0])*60*60 + (+temp[1])*60 + (+temp[2]) + 43200;
    }
}

function calculateRouteFromAtoB (platform, start, end, index) {
    routeRequestParams = {
        routingMode: 'fast',
        transportMode: 'pedestrian',
        origin: start.lat + ',' + start.lng, 
        destination: end.lat + ',' + end.lng,  
        return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
    };
    router.calculateRoute(routeRequestParams, (result) => {
        route = result.routes[0];
        let station = {};
        station["duration"] = calculateDuration(route);
        if (index == 0) {
            station["name"] = end.station_name;
            window.departure.push(station);
        } else {
            station["name"] = start.station_name;
            window.destination.push(station);
        }
    }, onError);
}

function calculateDuration(route) {
    let duration = 0;
    route.sections.forEach((section) => {
        duration += section.travelSummary.duration;
    });
    return duration;    
}

function onError(error) {
  document.querySelector(".ret").innerHTML = "Can't reach the remote server";
}

function createCard(userRoute, searchInfo, index) {
    var div = document.createElement('div');
    div.style.maxWidth = '1000px';
    div.className = 'card my-3 mx-auto';
    div.innerHTML = 
    '<div class="row g-0 border border-info">' +
        '<div class="col-md-3 border border-info rounded d-flex flex-column ' +
        'justify-content-around align-items-center">' +
          '<div class="text-start fs-6 mx-2 pt-4">' +
            '<span class="fw-bolder">Departure Time :</span> ' +
            '<span class="text-danger">' + userRoute.bus.dep_time + '</span></div>' +
          '<hr class="w-100"> ' +
          '<div class="text-start fs-6 mx-2">' +
            '<span class="fw-bolder">Arrival Time :</span> ' +
            '<span class="text-danger">' + userRoute.bus.des_time + '</span></div>' +
          '<hr class="w-100"> ' +
          '<div class="text-start fs-6 mx-2">' +
            '<span class="fw-bolder">Trip Duration :</span> ' +
            '<span class="text-danger">' + userRoute.bus.trip.toMMSS() + '</span></div>' +
            '<hr class="w-100"> ' +
          '<div class="text-start fs-6 mx-2 pb-4">' +
            '<span class="fw-bolder">Waiting Time :</span> ' +
            '<span class="text-danger">' + userRoute.bus.wait.toMMSS() + '</span></div>' +
        '</div>' +
        '<div class="col-md-9">' +
        '<h5 class="card-header fw-bolder fs-4">Bus Number : ' + userRoute.bus.number + '</h5>' +
          '<div class="card-body border-bottom">' +
            '<p class="card-text"><span class="fw-bold text-danger">' + 
            userRoute.to_dep.toMMSS() + '</span> ' +
                ' from <span class="fw-bold"> ' + searchInfo.departure.address + '</span> to ' +
                '<span class="fw-bold">' + userRoute.departure.station_name + '</span></p>' +
            '<h5 class="card-title"><span class="fw-bolder">Departure &#160; Station : </span>' +
                '<span class="text-muted">' + userRoute.departure.station_name + '</span></h5>' +
            '<h5 class="card-title"><span class="fw-bolder">Destination Station : </span>' +
                '<span class="text-muted">' + userRoute.destination.station_name + '</span></h5>' +
            '<p class="card-text"><span class="fw-bold text-danger">' + 
            userRoute.to_des.toMMSS() + '</span> ' +
                ' from <span class="fw-bold">'+ userRoute.destination.station_name + '</span> to ' +
                '<span class="fw-bold">' + searchInfo.destination.address + '</span></p>' +
            '<a href="#" class="btn btn-primary">Book a Ticket</a>' +
          '</div>';
    if (index == 0) {
        div.innerHTML += '<p class="card-text px-3"><small class="text-primary bg-warning">' + 
        'This is the best option we recommend</small></p></div></div>';
    }else {
        div.innerHTML += '</div></div>';
    }
    document.body.appendChild(div);
}

Number.prototype.toMMSS = function () {
    return Math.floor(this / 3600).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  }) +':'+ Math.floor((this % 3600) / 60).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  }) +':'+ ((this % 3600) % 60).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
}
</script>
<!--<script src="{{asset('demand/search_form.js')}}"></script>-->
@endsection