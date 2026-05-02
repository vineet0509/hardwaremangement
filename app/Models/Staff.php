<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToShop;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Staff extends Model
{
    use BelongsToShop, SoftDeletes;

    protected $fillable = [
        'name', 'phone', 'role', 'address',
        'aadhar_number', 'monthly_salary',
        'joining_date', 'status',
    ];

    protected $casts = [
        'monthly_salary' => 'float',
        'joining_date'   => 'date',
    ];

    public function salaryRecords(): HasMany
    {
        return $this->hasMany(SalaryRecord::class);
    }

    public function advancePayments(): HasMany
    {
        return $this->hasMany(AdvancePayment::class);
    }

    public function getPendingAdvanceAttribute(): float
    {
        return $this->advancePayments()->where('status', 'pending')->sum('amount');
    }
}

