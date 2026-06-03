<?php

namespace App\Traits;

use App\Models\Business;
use App\Models\Scopes\BusinessScope;

trait BelongsToBusiness
{
    protected static function bootBelongsToBusiness()
    {
        static::addGlobalScope(new BusinessScope);
        
        static::creating(function ($model) {
            if (auth('sanctum')->check() && !$model->business_id) {
                $model->business_id = auth('sanctum')->user()->business_id;
            } elseif (!$model->business_id) {
                // Fallback for internal calls
                $model->business_id = 1; 
            }
        });
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
