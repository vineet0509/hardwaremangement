<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'category_id', 'supplier_id', 'name', 'sku', 'description',
        'purchase_price', 'selling_price', 'quantity',
        'min_stock_alert', 'unit',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    protected $casts = [
        'purchase_price' => 'float',
        'selling_price'  => 'float',
        'quantity'       => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function billItems(): HasMany
    {
        return $this->hasMany(BillItem::class);
    }

    public function stockTransactions(): HasMany
    {
        return $this->hasMany(StockTransaction::class);
    }

    public function getLowStockAttribute(): bool
    {
        return $this->quantity <= $this->min_stock_alert;
    }
}

