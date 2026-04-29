<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdvancePayment extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'staff_id', 'amount', 'advance_date', 'reason', 'status',
    ];

    protected $casts = [
        'amount'       => 'float',
        'advance_date' => 'date',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }
}

