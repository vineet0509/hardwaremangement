<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Shop;
use App\Models\Setting;

class GstValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_shop_registration_succeeds_with_valid_indian_gstin(): void
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'mobile' => '9876543210',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'shop_name' => 'Apex Hardware',
            'gst_number' => '27AAPFU0939F1ZV',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('shops', [
            'name' => 'Apex Hardware',
            'gst_number' => '27AAPFU0939F1ZV',
        ]);
    }

    public function test_shop_registration_automatically_uppercases_and_trims_gstin(): void
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'mobile' => '9876543210',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'shop_name' => 'Apex Hardware',
            'gst_number' => '  27aapfu0939f1zv  ',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('shops', [
            'name' => 'Apex Hardware',
            'gst_number' => '27AAPFU0939F1ZV',
        ]);
    }

    public function test_shop_registration_fails_with_invalid_indian_gstin(): void
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'mobile' => '9876543210',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'shop_name' => 'Apex Hardware',
            'gst_number' => 'INVALIDGST12345',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gst_number']);
    }

    public function test_settings_update_succeeds_with_valid_gstin(): void
    {
        $shop = Shop::create([
            'name' => 'Original Shop',
            'gst_number' => null,
            'is_active' => true,
        ]);

        $user = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'mobile' => '9999999999',
            'password' => bcrypt('password123'),
            'shop_id' => $shop->id,
        ]);

        $settings = Setting::create([
            'shop_id' => $shop->id,
            'company_name' => 'Original Shop',
            'subscription_plan' => 'full_time',
        ]);

        $payload = [
            'company_name' => 'Apex Hardware Updated',
            'company_phone' => '1234567890',
            'company_address' => '123 Main St',
            'gst_number' => '07AAAAA1111A1ZY',
        ];

        $response = $this->actingAs($user)->postJson('/api/settings', $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('shops', [
            'id' => $shop->id,
            'gst_number' => '07AAAAA1111A1ZY',
        ]);
    }

    public function test_settings_update_fails_with_invalid_gstin(): void
    {
        $shop = Shop::create([
            'name' => 'Original Shop',
            'gst_number' => null,
            'is_active' => true,
        ]);

        $user = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'mobile' => '9999999999',
            'password' => bcrypt('password123'),
            'shop_id' => $shop->id,
        ]);

        $settings = Setting::create([
            'shop_id' => $shop->id,
            'company_name' => 'Original Shop',
            'subscription_plan' => 'full_time',
        ]);

        $payload = [
            'company_name' => 'Apex Hardware Updated',
            'company_phone' => '1234567890',
            'company_address' => '123 Main St',
            'gst_number' => '12345GSTININVALID',
        ];

        $response = $this->actingAs($user)->postJson('/api/settings', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gst_number']);
    }

    public function test_verify_gst_endpoint_succeeds_with_valid_gstin(): void
    {
        $response = $this->getJson('/api/verify-gst?gstin=27AAPFU0939F1ZV');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'valid' => true,
            'details' => [
                'state_code' => '27',
                'state_name' => 'Maharashtra',
                'pan' => 'AAPFU0939F',
            ]
        ]);
    }

    public function test_verify_gst_endpoint_indicates_invalid_with_incorrect_checksum(): void
    {
        $response = $this->getJson('/api/verify-gst?gstin=27AAPCS1234F1Z9'); // Wrong check digit

        $response->assertStatus(200);
        $response->assertJson([
            'success' => false,
            'valid' => false,
        ]);
    }

    public function test_verify_gst_endpoint_fails_when_parameter_missing(): void
    {
        $response = $this->getJson('/api/verify-gst');

        $response->assertStatus(400);
    }
}
