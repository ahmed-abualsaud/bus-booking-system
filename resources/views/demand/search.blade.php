@extends('layout.main')

@section('style')
@endsection

@section('content')

<div class="content">
    <form action="{{ route('search') }}" method="post" enctype="multipart/form-data">
        <div class="d-flex flex-column justify-content-center align-items-center mt-5">
            @csrf
            <div class="input-group w-75 mb-4">
                <span class="input-group-append position-absolute my-1 mx-2">
                    <span class="input-group-text bg-transparent border-0 p-0">
                        <img src="{{ asset('demand/departure.png') }}">
                    </span>
                </span> 
                <input id="departure" name="departure" type="text" class="form-control bg-transparent px-5" placeholder="Enter Departure Address">

                <input id="dep_lat"  name="dep_lat" type="text" class="d-none">
                <input id="dep_lng"  name="dep_lng" type="text" class="d-none">

                <span role="button" class="input-group-append position-absolute end-0 p-0">
                    <span onclick="openMap(0)" class="input-group-text p-0" data-bs-toggle="modal" data-bs-target="#exampleModal" data-bs-toggle="tooltip" data-bs-placement="left" title="Get Location Address">
                        <img src="{{ asset('demand/location.png') }}">
                    </span>
                </span>
            </div>
            <div class="input-group w-75 mb-4">
                <span class="input-group-append position-absolute my-1 mx-2">
                    <span class="input-group-text bg-transparent border-0 p-0">
                        <img src="{{ asset('demand/arrival.png') }}">
                    </span>
                </span> 
                <input id="destination" name="destination" type="text" class="form-control bg-transparent px-5" placeholder="Enter Destination Address">

                <input id="des_lat"  name="des_lat" type="text" class="d-none">
                <input id="des_lng"  name="des_lng" type="text" class="d-none">

                <span role="button" class="input-group-append position-absolute end-0 p-0">
                    <span onclick="openMap(1)" class="input-group-text p-0" data-bs-toggle="modal" data-bs-target="#exampleModal" data-bs-toggle="tooltip" data-bs-placement="left" title="Get Location Address">
                        <img src="{{ asset('demand/location.png') }}">
                    </span>
                </span>
            </div>       
            <button type="submit" class="btn btn-info w-75">Search</button>   
        </div>
    </form>
</div>

    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg w-100 h-100">
        <div class="modal-content w-100 h-75">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Locations Map</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="map w-100 h-100">
                
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button onclick="getLocation()" type="button" class="btn btn-primary">Get Current Location</button>
          </div>
        </div>
      </div>
    </div>


@endsection

@section('script')
<script src="{{asset('demand/search_form.js')}}"></script>
@endsection