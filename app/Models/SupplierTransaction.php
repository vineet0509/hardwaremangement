<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;

class SupplierTransaction extends Model
{
    use BelongsToBusiness;

    protected $fillable = [
        'business_id',
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
