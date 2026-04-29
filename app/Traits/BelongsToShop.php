<?php

namespace App\Traits;

use App\Models\Shop;
use App\Models\Scopes\ShopScope;

trait BelongsToShop
{
    protected static function bootBelongsToShop()
    {
        static::addGlobalScope(new ShopScope);
        
        static::creating(function ($model) {
            if (auth('sanctum')->check() && !$model->shop_id) {
                $model->shop_id = auth('sanctum')->user()->shop_id;
            } elseif (!$model->shop_id) {
                // Fallback for internal calls
                $model->shop_id = 1; 
            }
        });
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
