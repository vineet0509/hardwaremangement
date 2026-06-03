<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToBusiness;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use BelongsToBusiness, SoftDeletes;

    protected $fillable = [
        'business_id',
        'name',
        'phone',
        'email',
        'address'
    ];

    public function transactions()
    {
        return $this->hasMany(SupplierTransaction::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
