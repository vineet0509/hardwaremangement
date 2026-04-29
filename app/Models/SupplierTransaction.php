<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Scopes\ShopScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ScopedBy([ShopScope::class])]
class SupplierTransaction extends Model
{
    protected $fillable = [
        'shop_id',
        'supplier_id',
        'type',
        'amount',
        'transaction_date',
        'notes'
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (auth()->check() && !isset($model->shop_id)) {
                $model->shop_id = auth()->user()->shop_id;
            }
        });
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
