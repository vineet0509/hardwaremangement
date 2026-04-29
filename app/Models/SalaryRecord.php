<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryRecord extends Model
{
    use BelongsToShop;

    protected $fillable = [
        'staff_id', 'month', 'year',
        'basic_salary', 'bonus', 'deductions', 'net_salary',
        'paid_amount', 'status', 'payment_date', 'notes',
    ];

    protected $casts = [
        'basic_salary'  => 'float',
        'bonus'         => 'float',
        'deductions'    => 'float',
        'net_salary'    => 'float',
        'paid_amount'   => 'float',
        'payment_date'  => 'date',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }
}

