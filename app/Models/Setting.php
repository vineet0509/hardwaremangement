<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;

class Setting extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'shop_id',
        'company_name',
        'company_phone',
        'company_address',
        'subscription_plan',
        'subscription_expires_at'
    ];

    protected $casts = [
        'subscription_expires_at' => 'date',
    ];
}

