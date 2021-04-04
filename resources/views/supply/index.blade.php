@extends('layout.main')

@section('style')

    <!-- The core Firebase JS SDK is always required and must be listed first -->
    <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-database.js"></script>
    <!-- TODO: Add SDKs for Firebase products that you want to use
    https://firebase.google.com/docs/web/setup#available-libraries -->
    <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-analytics.js"></script>

    <link rel="stylesheet" type="text/css" href="{{asset('supply/style.css')}}">
@endsection

@section('content')
    <div class="content">
        <div class="map">
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
    <script src="{{asset('supply/map.js')}}"></script>
@endsection