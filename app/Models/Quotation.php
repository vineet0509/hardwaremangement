<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Scopes\ShopScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ScopedBy([ShopScope::class])]
class Quotation extends Model
{
    use SoftDeletes;
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

    protected static function booted()
    {
        static::creating(function ($model) {
            if (auth()->check() && !isset($model->shop_id)) {
                $model->shop_id = auth()->user()->shop_id;
            }
        });
    }

    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }
}
