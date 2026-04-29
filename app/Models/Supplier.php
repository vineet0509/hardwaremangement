<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Scopes\ShopScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ScopedBy([ShopScope::class])]
class Supplier extends Model
{
    protected $fillable = [
        'shop_id',
        'name',
        'phone',
        'email',
        'address'
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (auth()->check() && !isset($model->shop_id)) {
                $model->shop_id = auth()->user()->shop_id;
            }
        });
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
