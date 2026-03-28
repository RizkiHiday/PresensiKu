<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    protected $fillable = [
        'user_id', 'start_date', 'end_date', 'type', 'reason', 'status', 'attachment', 'admin_note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
