<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Rules\ValidGstin;
use Validator;

class GstController extends Controller
{
    private static $stateCodes = [
        '01' => 'Jammu & Kashmir',
        '02' => 'Himachal Pradesh',
        '03' => 'Punjab',
        '04' => 'Chandigarh',
        '05' => 'Uttarakhand',
        '06' => 'Haryana',
        '07' => 'Delhi',
        '08' => 'Rajasthan',
        '09' => 'Uttar Pradesh',
        '10' => 'Bihar',
        '11' => 'Sikkim',
        '12' => 'Arunachal Pradesh',
        '13' => 'Nagaland',
        '14' => 'Manipur',
        '15' => 'Mizoram',
        '16' => 'Tripura',
        '17' => 'Meghalaya',
        '18' => 'Assam',
        '19' => 'West Bengal',
        '20' => 'Jharkhand',
        '21' => 'Odisha',
        '22' => 'Chhattisgarh',
        '23' => 'Madhya Pradesh',
        '24' => 'Gujarat',
        '25' => 'Daman & Diu',
        '26' => 'Dadra & Nagar Haveli',
        '27' => 'Maharashtra',
        '28' => 'Andhra Pradesh',
        '29' => 'Karnataka',
        '30' => 'Goa',
        '31' => 'Lakshadweep',
        '32' => 'Kerala',
        '33' => 'Tamil Nadu',
        '34' => 'Puducherry',
        '35' => 'Andaman & Nicobar Islands',
        '36' => 'Telangana',
        '37' => 'Andhra Pradesh (New)',
        '38' => 'Ladakh'
    ];

    /**
     * Verify a GSTIN offline via MOD-36 checksum and extract details.
     */
    public function verify(Request $request): JsonResponse
    {
        $gstin = strtoupper(trim($request->query('gstin', '')));

        if (empty($gstin)) {
            return response()->json([
                'success' => false,
                'message' => 'GSTIN parameter is required.'
            ], 400);
        }

        // Validate using the custom ValidGstin rule
        $validator = Validator::make(['gstin' => $gstin], [
            'gstin' => [new ValidGstin()]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => $validator->errors()->first('gstin')
            ], 200); // Return 200 with valid: false to handle UI properly
        }

        // Extract metadata details
        $stateCode = substr($gstin, 0, 2);
        $pan = substr($gstin, 2, 10);
        $stateName = self::$stateCodes[$stateCode] ?? 'Unknown State / Union Territory';

        return response()->json([
            'success' => true,
            'valid' => true,
            'gstin' => $gstin,
            'details' => [
                'state_code' => $stateCode,
                'state_name' => $stateName,
                'pan' => $pan,
                'entity_number' => substr($gstin, 12, 1),
                'check_digit' => substr($gstin, 14, 1),
            ],
            'message' => "GSTIN is mathematically valid. State: {$stateName}."
        ]);
    }
}
