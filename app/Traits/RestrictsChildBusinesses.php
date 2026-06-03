<?php

namespace App\Traits;

use App\Models\Business;

trait RestrictsChildBusinesses
{
    /**
     * Determine if the current request is operating within a child shop context.
     * Returns true if it is a child shop, false otherwise.
     *
     * @return bool
     */
    protected function isChildShopContext(): bool
    {
        if (!auth('sanctum')->check()) {
            return false;
        }

        $businessId = auth('sanctum')->user()->business_id;
        $requestedBusinessId = request()->header('X-Business-Id');

        if ($requestedBusinessId && $requestedBusinessId != $businessId) {
            $childBusiness = Business::where('id', $requestedBusinessId)->where('parent_id', $businessId)->first();
            if ($childBusiness) {
                return true;
            }
        } else {
            $currentShop = Business::find($businessId);
            if ($currentShop && $currentShop->parent_id !== null) {
                return true;
            }
        }

        return false;
    }
}
