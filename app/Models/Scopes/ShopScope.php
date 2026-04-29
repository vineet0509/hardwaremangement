<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class ShopScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        // If the user is authenticated via Sanctum, scope their queries.
        // For development/testing where auth might be bypassed initially, we could conditionally scope it.
        // Ensure Shop ID is always isolated.
        if (auth('sanctum')->check()) {
            $builder->where($model->getTable() . '.shop_id', auth('sanctum')->user()->shop_id);
        } else {
            // For unauthenticated internal CLI queries or seeders
            $builder->where($model->getTable() . '.shop_id', 1);
        }
    }
}
