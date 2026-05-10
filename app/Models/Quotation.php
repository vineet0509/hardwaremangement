<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;
use Illuminate\Database\Eloquent\SoftDeletes;
class Quotation extends Model
{
    use BelongsToShop, SoftDeletes;
    protected $fillable = [
        'shop_id',
        'quotation_number',
        'customer_name',
        'customer_phone',
        'customer_address',
        'subtotal',
        'discount',
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
