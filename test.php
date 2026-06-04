<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Staff;
use App\Models\Attendance;
use App\Http\Controllers\Api\AttendanceController;
use Illuminate\Http\Request;

$u = User::factory()->create(['role' => 'staff']);
$s = Staff::create(['user_id' => $u->id, 'business_id' => $u->business_id, 'name' => 'Test', 'role' => 'Labour', 'joining_date' => now()]);

$req = Request::create('/attendance/clock-in', 'POST', ['latitude' => 12.34, 'longitude' => 56.78]);
$req->setUserResolver(fn() => $u);

$c = app(AttendanceController::class);
$c->clockIn($req);

echo json_encode(Attendance::first()->toArray());
