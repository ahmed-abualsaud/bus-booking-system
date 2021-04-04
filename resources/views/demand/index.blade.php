@extends('layout.main')

@section('style')
    <link rel="stylesheet" type="text/css" href="{{asset('demand/style.css')}}">
@endsection

@section('content')
    <div class="content">
        <div class="map">
        </div>
        <div class="search" onclick="searchSupply()">
            Search
        </div>
        <div class="panel"></div>
        <div class="ret">
        </div>


    </div>
    <div id="bus" style="display: none;">
        {{ $bus }}
    </div>

    
@endsection

@section('script')
    <script src="{{asset('demand/map.js')}}"></script>
    
@endsection