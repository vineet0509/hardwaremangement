<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillItem extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'bill_id', 'product_id', 'product_name',
        'price', 'quantity', 'discount', 'total',
    ];

    protected $casts = [
        'price'    => 'float',
        'quantity' => 'integer',
        'discount' => 'float',
        'total'    => 'float',
    ];

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

