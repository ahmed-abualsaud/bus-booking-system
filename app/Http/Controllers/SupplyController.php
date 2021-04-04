<?php

namespace App\Http\Controllers;

use Enqueue\RdKafka\RdKafkaConnectionFactory;
use Illuminate\Http\Request;
use App\Models\Station;
use App\Events\SendLocation;
use App\Models\Bus;

class SupplyController extends Controller
{
	//public $locations;

    public function itinerary($id) {
    	$busNumber = Bus::find($id)->number;
    	return view('supply.index', ['bus' => $busNumber]);
    }

    public function getStations(Request $request)
    {
    	$stations = Bus::where('number', $request->number)->first()->stations;
    	return $stations; 
    }
    
//----------------------------------------------------------------------------------------------
    /*public function consumeFromKAFKA(Request $request) {
    	$initialTime = time();
    	$connectionFactory = new RdKafkaConnectionFactory();
    	$context = $connectionFactory->createContext();
    	$fooQueue = $context->createQueue($request->topic);
		$consumer = $context->createConsumer($fooQueue);
		$consumer->setCommitAsync(true);
    	while((time() - $initialTime) <= 20) {
    		$initialTime = time();
    		$message = $consumer->receive();
    		$consumer->acknowledge($message);
    		if ((time() - $initialTime) <= 20) {
    			event(new SendLocation($message->body, $request->topic));
    		}
    	}
    	return 'done';
    }*/
    
    /*public function produceToKAFKA() {
    	$connectionFactory = new RdKafkaConnectionFactory();
    	$context = $connectionFactory->createContext();
    	$message = $context->createMessage("My Name Is Ahmed");
    	$fooTopic = $context->createTopic('busbook');
    	$context->createProducer()->send($fooTopic, $message);
    }*/
}
