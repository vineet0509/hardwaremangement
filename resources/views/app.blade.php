<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Hardware Shop SaaS Manager | Multi-Tenant POS & Inventory Software</title>
    <meta name="description" content="Launch and scale your hardware business with the most powerful multi-tenant management solution. Manage shops, invoices, khata ledgers, staff payroll, and business audits dynamically.">
    <meta name="keywords" content="hardware shop software, billing system, khata book for stores, saas retail, multi tenant POS, stock controller, inventory management, staff payments">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Hardware Shop SaaS Manager | Multi-Tenant POS & Inventory Software">
    <meta property="og:description" content="Complete billing, POS and hardware shop store analytics suite. Multi-tenant access with simple controls.">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="Hardware Shop SaaS Manager | Multi-Tenant POS & Inventory Software">
    <meta property="twitter:description" content="Manage multiple storefronts seamlessly with our custom hardware management platform.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#4f46e5">
    <link rel="apple-touch-icon" href="/icon-192x192.png">
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    <script>
        window.API_URL = "{{ url('/api') }}";
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    </script>
</head>
<body>
    <div id="app"></div>
</body>
</html>
