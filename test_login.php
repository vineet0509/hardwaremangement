<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/login', 'POST', ['login'=>'vineetpandey051996@gmail.com', 'password'=>'12345678']);
$request->headers->set('Accept', 'application/json');
$response = $kernel->handle($request);
echo 'STATUS: '.$response->getStatusCode()."\n";
echo 'BODY: '.$response->getContent();
