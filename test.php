<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create("/api/settings", "POST");
$request->headers->set("Accept", "application/json");
$user = App\Models\User::first();
auth()->login($user);
$request->merge(["company_name" => "Test"]);

try {
    app()->make(App\Http\Controllers\Api\SettingsController::class)->update($request);
    echo "Success\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
