<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Station;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
    	'name',
        'number',
    ];

    public function stations()
    {
        return $this->belongsToMany(Station::class)->withPivot('arrival_time');
    }
}
