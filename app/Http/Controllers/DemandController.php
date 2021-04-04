<?php

namespace App\Http\Controllers;

use Enqueue\RdKafka\RdKafkaConnectionFactory;
use Illuminate\Http\Request;
use S2\S2CellId;
use S2\S2LatLng;
use App\Models\Station;
use App\Models\Bus;

class DemandController extends Controller
{	
    public function explore() {
    	$busNumber = Bus::first()->number;
    	return view('demand.index', ['bus' => $busNumber]);
    }

    public function searchView() {
    	return view('demand.search');
    }

    public function search(Request $request) {
    	$departureLocation = (object) [
    		'lat' => $request->dep_lat, 
    		'lng' => $request->dep_lng
    	];
    	$destinationLocation = (object) [
    		'lat' => $request->des_lat, 
    		'lng' => $request->des_lng
    	];
    	$stations = Station::all();
    	$numberOfStations = Station::count();
    	$sortedDepartureStations =  $this->sortStationsWithRespectToNearnessMetric($stations, $departureLocation);
    	$stationPairs = $this->getMutuallySortedNearestStations($sortedDepartureStations, $departureLocation, $destinationLocation);
    	$tripLines = $this->getNearestStationPairsBuses($stationPairs);
    	$searchInfo = (object) [
    		'departure' => (object)[
    			'address' => $request->departure,
    			'lat'	  => $request->dep_lat,
    			'lng'	  => $request->dep_lng
    		],
    		'destination' => (object)[
    			'address' => $request->destination,
    			'lat'	  => $request->des_lat,
    			'lng'	  => $request->des_lng
    		]
    	];
    	return view('demand.search_result', [
    		'tripLines' => $tripLines, 
    		'searchInfo' => $searchInfo
    	]);
    }
//---------------------------------------------------------------------------------------
    private function getNearestStationPairsBuses($stationPairs) {
    	$tripLines = null;
    	$count = 0;
    	$stationPairsLength = count($stationPairs);
    	for ($i=0; $i < $stationPairsLength; $i++) { 
    		$buses = $this->searchForCommonBuses($stationPairs[$i]["departure"], $stationPairs[$i]["destination"]);
    		if ($buses != null) {
				$tripLines[$count] = (object) [
					'departure' => $stationPairs[$i]["departure"],
					'destination' => $stationPairs[$i]["destination"],
					'buses' => $buses
				]; 
				$count++;
			}
    	}
    	return $tripLines;
    }

    private function searchForCommonBuses($departure, $destination) {
    	if ($departure->id != $destination->id) {
	    	$departureBuses = Station::find($departure->id)->buses->intersect(
	    		Station::find($destination->id)->buses
	    	);
	    	$destinationBuses = Station::find($destination->id)->buses->intersect(
	    		Station::find($departure->id)->buses
	    	);
	    	if (count($departureBuses) == 0 || count($destinationBuses) == 0) {
	    		return null;
	    	}
	    	return ['departure' => $departureBuses, 'destination' => $destinationBuses];
    	} else return null;
    }

    private function sortStationsWithRespectToNearnessMetric($stations, $location) {
    	$numberOfStations = count($stations);
    	$nearMetrics = $this->mapStationsToNearnessMetrics($stations, $location);
    	$sortedNearMetrics = $nearMetrics;
    	sort($sortedNearMetrics);
    	$nearestStations = [];
    	$sortedNearMetricsLength = count($sortedNearMetrics);

    	for($i=0; $i < $sortedNearMetricsLength; $i++) { 
    		$key = array_search($sortedNearMetrics[$i], $nearMetrics);
    		$nearestStations[$i] = $stations[$key];
    	}
    	return $nearestStations;
    }

    private function getMutuallySortedNearestStations($stations, $departureLocation, 
    	$destinationLocation) {
    	$departureMetric = $this->mapStationsToNearnessMetrics($stations, $departureLocation);
    	$destinationMetric = $this->mapStationsToNearnessMetrics($stations, $destinationLocation);
    	$numberOfStations = count($stations);
    	$stationPairs = [];
    	$count = 0;
    	for ($i=0; $i < $numberOfStations; $i++) { 
    		for ($j=$i+1; $j < $numberOfStations; $j++) { 
    			$stationPairs[$count] = [
					'departure' => $stations[$i],
					'destination' => $stations[$j],
					'nearness' => $departureMetric[$i] + $destinationMetric[$j]
				];
				$count++;
    		}
    	}
    	$nearness = array_column($stationPairs, 'nearness');
    	array_multisort($nearness, $stationPairs);
    	return $stationPairs;
    }

    private function mapStationsToNearnessMetrics($stations, $location) {
    	$IDs = [];
    	$id1 = $this->locationToId($location->lat, $location->lng);
    	$numberOfStations = count($stations);
    	for($i=0; $i < $numberOfStations; $i++) { 
    		$id2 = $this->locationToId($stations[$i]->lat, $stations[$i]->lng);
    		$IDs[$i] = $this->idToNearnessMetric($id1, $id2);
    	}
    	return $IDs;
    }

    private function idToNearnessMetric($id1, $id2) {
    	return abs($id1 - $id2);
    }

    private function locationToId($lat, $lng) {
		return S2CellId::fromLatLng(S2LatLng::fromDegrees($lat, $lng))->id();    	
    }
//---------------------------------------------------------------------------------------
    public function getStationBuses(Request $request) {
    	$buses = Station::find($request->id)->buses;
    	return json_encode($buses);
    }

    public function getBusStations(Request $request) {
    	$stations = Bus::find($request->id)->stations;
    	return json_encode($stations);
    }
//---------------------------------------------------------------------------------------
    /*public function pusherAuth(Request $request) {
    	$channel=$request->channel_name;
 		$socketId = $request->socket_id;
 		$string_to_sign = $socketId.':'.$channel;
 		$secret = env('PUSHER_APP_SECRET');
 		$key = env('PUSHER_APP_KEY');
 		$hmac_sha256 = hash_hmac('sha256', $string_to_sign, $secret);
 		$auth_string = $key.':'.$hmac_sha256;
 		return response()->json(["auth" => $auth_string]);
    }*/
}
