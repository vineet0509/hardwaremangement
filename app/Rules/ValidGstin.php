<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidGstin implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $gstin = strtoupper(trim($value));

        // 1. Basic format validation
        if (!preg_match("/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/", $gstin)) {
            $fail('The :attribute format is invalid. Standard format: 27AAPCS1234F1Z5.');
            return;
        }

        // 2. MOD-36 Checksum Validation (Indian GSTIN check digit algorithm)
        $inputChars = str_split(substr($gstin, 0, 14));
        $checksumDigit = substr($gstin, 14, 1);
        
        $lookup = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        $charCodeSum = 0;
        
        foreach ($inputChars as $i => $char) {
            $charValue = strpos($lookup, $char);
            if ($charValue === false) {
                $fail('The :attribute contains invalid characters.');
                return;
            }
            
            // Weighted factor: 1 for odd positions (0, 2, 4...), 2 for even positions (1, 3, 5...)
            $factor = ($i % 2 === 0) ? 1 : 2;
            $product = $charValue * $factor;
            
            $product = intval($product / 36) + ($product % 36);
            $charCodeSum += $product;
        }
        
        $remainder = $charCodeSum % 36;
        $checkCode = 36 - $remainder;
        if ($checkCode === 36) {
            $checkCode = 0;
        }
        
        $expectedCheckDigit = $lookup[$checkCode];
        
        if ($expectedCheckDigit !== $checksumDigit) {
            $fail('The :attribute check digit is invalid. Please double check the number.');
        }
    }
}
