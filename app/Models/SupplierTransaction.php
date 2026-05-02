<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;

class SupplierTransaction extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'shop_id',
        'supplier_id',
        'type',
        'amount',
        'transaction_date',
        'notes'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
