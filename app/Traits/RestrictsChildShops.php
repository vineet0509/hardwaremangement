<?php

namespace App\Traits;

use App\Models\Shop;

trait RestrictsChildShops
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

        $shopId = auth('sanctum')->user()->shop_id;
        $requestedShopId = request()->header('X-Shop-Id');

        if ($requestedShopId && $requestedShopId != $shopId) {
            $childShop = Shop::where('id', $requestedShopId)->where('parent_id', $shopId)->first();
            if ($childShop) {
                return true;
            }
        } else {
            $currentShop = Shop::find($shopId);
            if ($currentShop && $currentShop->parent_id !== null) {
                return true;
            }
        }

        return false;
    }
}
