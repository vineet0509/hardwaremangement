<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$file = \Illuminate\Http\UploadedFile::fake()->image("logo.png");
$request = Illuminate\Http\Request::create("/api/settings", "POST", [
    "company_name" => "Test"
], [], [
    "company_logo" => $file
]);
$request->headers->set("Accept", "application/json");
$user = App\Models\User::first();
auth()->login($user);

try {
    $response = app()->make(App\Http\Controllers\Api\SettingsController::class)->update($request);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo $response->getContent();
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
