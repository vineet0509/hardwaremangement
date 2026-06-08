<?php

namespace App\Helpers;

class PlanHelper
{
    public static function getPlanLimits($plan_type)
    {
        $plan = strtolower($plan_type ?: 'free');

        $limits = [
            'free' => [
                'shops' => 1,
                'users' => 1,
                'staff' => 0,
                'invoices_per_month' => 100,
                'features' => ['billing', 'inventory', 'customers', 'suppliers']
            ],
            'starter' => [
                'shops' => 1,
                'users' => 2,
                'staff' => 0,
                'invoices_per_month' => -1, // Unlimited
                'features' => ['billing', 'inventory', 'customers', 'suppliers', 'gst_reports', 'whatsapp_sharing']
            ],
            'business' => [
                'shops' => 1,
                'users' => 5,
                'staff' => 25,
                'invoices_per_month' => -1,
                'features' => ['billing', 'inventory', 'customers', 'suppliers', 'gst_reports', 'whatsapp_sharing', 'staff_management', 'attendance', 'salary', 'expense_tracking']
            ],
            'enterprise' => [
                'shops' => -1, // Unlimited
                'users' => -1, // Unlimited
                'staff' => -1, // Unlimited
                'invoices_per_month' => -1,
                'features' => ['billing', 'inventory', 'customers', 'suppliers', 'gst_reports', 'whatsapp_sharing', 'staff_management', 'attendance', 'salary', 'expense_tracking', 'role_permission', 'branch_transfer', 'api_access', 'ai_features']
            ],
        ];

        return $limits[$plan] ?? $limits['free'];
    }

    public static function hasFeature($plan_type, $feature)
    {
        $limits = self::getPlanLimits($plan_type);
        return in_array($feature, $limits['features']);
    }

    public static function checkLimit($plan_type, $limit_key, $current_count)
    {
        $limits = self::getPlanLimits($plan_type);
        $max = $limits[$limit_key] ?? 0;
        
        // -1 means unlimited
        if ($max === -1) {
            return true;
        }

        return $current_count < $max;
    }
}
