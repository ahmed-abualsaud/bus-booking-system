<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {

    return view('welcome');
});


Route::get('/explore', [App\Http\Controllers\DemandController::class, 'explore'])->name('explore');
Route::post('/getFiveNearestStations', [App\Http\Controllers\DemandController::class, 'getFiveNearestStations']);
Route::post('/getStationBuses', [App\Http\Controllers\DemandController::class, 'getStationBuses']);
Route::post('/getBusStations', [App\Http\Controllers\DemandController::class, 'getBusStations']);
Route::get('/search-form', [App\Http\Controllers\DemandController::class, 'searchView']);
Route::post('/search', [App\Http\Controllers\DemandController::class, 'search'])->name('search');


/*Route::post('/pusher/auth', [App\Http\Controllers\DemandController::class, 'pusherAuth']);
*/
//----------------------------------------------------------------------------------------------

Route::get('/itinerary/{id}', [App\Http\Controllers\SupplyController::class, 'itinerary'])->name('itinerary');
Route::post('/getStations', [App\Http\Controllers\SupplyController::class, 'getStations']);

/*Route::post('/consume', [App\Http\Controllers\SupplyController::class, 'consumeFromKAFKA'])->name('consume');
Route::get('/produce', [App\Http\Controllers\SupplyController::class, 'produceToKAFKA'])->name('produce');*/

