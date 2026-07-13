<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransaction extends Model
{
    use BelongsToBusiness;

    protected $fillable = [
        'product_id', 'type', 'quantity', 'remaining_quantity', 'price', 'expiry_date', 'reference', 'notes',
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

