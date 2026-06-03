<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    use BelongsToBusiness, SoftDeletes;

    protected $fillable = [
        'bill_number', 'customer_name', 'customer_phone', 'customer_address',
        'subtotal', 'discount', 'tax', 'total',
        'paid_amount', 'due_amount',
        'payment_method', 'status', 'notes', 'is_gst', 'user_id',
    ];

    protected $casts = [
        'subtotal'    => 'float',
        'discount'    => 'float',
        'tax'         => 'float',
        'total'       => 'float',
        'paid_amount' => 'float',
        'due_amount'  => 'float',
        'is_gst'      => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(BillItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function generateBillNumber(): string
    {
        $prefix = 'INV-' . date('Ymd') . '-';
        $last = self::where('bill_number', 'like', $prefix . '%')->latest()->first();
        $seq = $last ? (int) substr($last->bill_number, -4) + 1 : 1;
        return $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}

