@extends('layout.main')

@section('style')
    <link rel="stylesheet" href="{{asset('welcome-page/style.css')}}">
@endsection

@section('content')
    @if (Route::has('login'))
        <div class="hidden fixed top-0 right-0 px-6 py-4 sm:block">
            @auth
                <a href="{{ url('/home') }}" class="text-sm text-gray-700 underline">Home</a>
            @else
                <a href="{{ route('login') }}" class="text-sm text-gray-700 underline">Log in</a>

                @if (Route::has('register'))
                    <a href="{{ route('register') }}" class="ml-4 text-sm text-gray-700 underline">Register</a>
                @endif
            @endauth
        </div>
    @endif

    <div>       
        <div class="loader">
            <div class="ringOne ring">
                <img src="{{ asset('welcome-page/ring.png') }}" alt="">
            </div>
            <div class="ringTwo ring">
                <img src="{{ asset('welcome-page/ring.png') }}" alt="">
            </div>
            <div class="ringTwo ring">
                <img class="earth" src="{{ asset('welcome-page/earth.png') }}" alt="">
            </div>
        </div>

    </div>

    

    <div class="logo">
        <ion-icon name="git-compare"></ion-icon>FilesFiddle
    </div>

    <div class="contact">GET IN TOUCH</div>

    <div class="menu"><ion-icon name="options"></ion-icon></div>

    <div class="header">
        
        <h1 class="ml7" id="title">            
              <span class="text-wrapper">
                    <span class="letters">The connected world</span>
              </span>
        </h1>
                        
                        
        <p id="tagline" class="p1">Lorem ipsum dolor sit amet, consectetur </p>
        
        <br><br>
        
        <p id="tagline" class="p2">Lorem ipsum dolor, sit amet consectetur</p>
        
        <div class="buttons">
              <a id="one" href="{{route('itinerary')}}">ITINERARY</a>
              <a id="two" href="{{route('explore')}}">EXPLORE</a>
        </div>

    </div>

    <div class="copyright">© 2019 by Codegrid. All rights reserved.</div>


    <div class="media">
        <ul>
              <li><ion-icon name="logo-facebook"></ion-icon></li>
              <li><ion-icon name="logo-instagram"></ion-icon></li>
              <li><ion-icon name="logo-twitter"></ion-icon></li>
              <li><ion-icon name="logo-youtube"></ion-icon></li>
        </ul>
    </div>
@endsection

@section('script')
    <script src="{{asset('welcome-page/script.js')}}"></script>
@endsection