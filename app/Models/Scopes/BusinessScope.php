<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class BusinessScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        // If the user is authenticated via Sanctum, scope their queries.
        // For development/testing where auth might be bypassed initially, we could conditionally scope it.
        // Ensure Shop ID is always isolated.
        if (auth('sanctum')->check()) {
            $user = auth('sanctum')->user();
            $businessId = $user->business_id;

            $isChildContext = false;
            $parentBusinessId = null;

            $requestedBusinessId = request()->header('X-Business-Id');
            if ($requestedBusinessId && $requestedBusinessId != $businessId) {
                // Verify the requested shop is a child of the user's primary shop
                $childBusiness = \App\Models\Business::where('id', $requestedBusinessId)
                    ->where('parent_id', $businessId)
                    ->first();
                if ($childBusiness) {
                    $businessId = $requestedBusinessId;
                    $isChildContext = true;
                    $parentBusinessId = $childBusiness->parent_id;
                }
            } else {
                // The logged in user might natively belong to a child shop
                $currentShop = \App\Models\Business::find($businessId);
                if ($currentShop && $currentShop->parent_id !== null) {
                    $isChildContext = true;
                    $parentBusinessId = $currentShop->parent_id;
                }
            }

            $modelTable = $model->getTable();
            $sharedTables = ['products', 'categories', 'suppliers', 'supplier_transactions'];

            if ($isChildContext && in_array($modelTable, $sharedTables)) {
                $builder->where($modelTable . '.business_id', $parentBusinessId);
            } else {
                $builder->where($modelTable . '.business_id', $businessId);
            }
        } else {
            // For unauthenticated internal CLI queries or seeders
            $builder->where($model->getTable() . '.business_id', 1);
        }
    }
}
