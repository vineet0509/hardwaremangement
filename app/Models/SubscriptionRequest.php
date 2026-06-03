<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;

class SubscriptionRequest extends Model
{
    use BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'plan_type',
        'amount',
        'status',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
