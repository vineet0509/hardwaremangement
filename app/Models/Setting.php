<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;

class Setting extends Model
{
    use BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'company_name',
        'company_phone',
        'company_address',
        'subscription_plan',
        'subscription_expires_at',
        'razorpay_key',
        'razorpay_secret',
        'razorpay_webhook_secret',
        'upi_qr_code'
    ];

    protected $casts = [
        'subscription_expires_at' => 'date',
    ];
}

