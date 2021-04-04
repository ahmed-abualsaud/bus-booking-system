<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Bus;

class Station extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'station_name',
        'lat',
        'lng',
    ];

    public function buses()
    {
        return $this->belongsToMany(Bus::class)->withPivot('arrival_time');
    }
}
