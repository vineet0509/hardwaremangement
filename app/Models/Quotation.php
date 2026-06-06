<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use Illuminate\Database\Eloquent\SoftDeletes;
class Quotation extends Model
{
    use BelongsToBusiness, SoftDeletes;
    protected $fillable = [
        'business_id',
        'quotation_number',
        'customer_name',
        'customer_phone',
        'customer_address',
        'subtotal',
        'discount',
        'other_charges',
        'tax',
        'total',
        'notes',
        'is_gst'
    ];



    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }
}
