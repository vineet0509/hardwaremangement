<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Staff extends Model
{
    use BelongsToBusiness, SoftDeletes;

    protected $fillable = [
        'name', 'phone', 'role', 'address',
        'aadhar_number', 'monthly_salary',
        'joining_date', 'status', 'user_id',
        'emergency_contact', 'commission_percent'
    ];

    protected $casts = [
        'monthly_salary' => 'float',
        'commission_percent' => 'float',
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

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}

