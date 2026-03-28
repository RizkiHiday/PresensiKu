<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'check_in',
        'check_out',
        'status',
        'latitude',
        'longitude',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

