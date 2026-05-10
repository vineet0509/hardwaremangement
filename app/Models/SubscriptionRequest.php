<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;

class SubscriptionRequest extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'shop_id',
        'plan_type',
        'amount',
        'status',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
