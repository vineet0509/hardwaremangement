<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransaction extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'product_id', 'type', 'quantity', 'price', 'reference', 'notes',
    ];

    protected $casts = [
        'price'    => 'float',
        'quantity' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

