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
            $user = auth('sanctum')->user();
            $shopId = $user->shop_id;

            $isChildContext = false;
            $parentShopId = null;

            $requestedShopId = request()->header('X-Shop-Id');
            if ($requestedShopId && $requestedShopId != $shopId) {
                // Verify the requested shop is a child of the user's primary shop
                $childShop = \App\Models\Shop::where('id', $requestedShopId)
                    ->where('parent_id', $shopId)
                    ->first();
                if ($childShop) {
                    $shopId = $requestedShopId;
                    $isChildContext = true;
                    $parentShopId = $childShop->parent_id;
                }
            } else {
                // The logged in user might natively belong to a child shop
                $currentShop = \App\Models\Shop::find($shopId);
                if ($currentShop && $currentShop->parent_id !== null) {
                    $isChildContext = true;
                    $parentShopId = $currentShop->parent_id;
                }
            }

            $modelTable = $model->getTable();
            $sharedTables = ['products', 'categories', 'suppliers', 'supplier_transactions'];

            if ($isChildContext && in_array($modelTable, $sharedTables)) {
                $builder->where($modelTable . '.shop_id', $parentShopId);
            } else {
                $builder->where($modelTable . '.shop_id', $shopId);
            }
        } else {
            // For unauthenticated internal CLI queries or seeders
            $builder->where($model->getTable() . '.shop_id', 1);
        }
    }
}
