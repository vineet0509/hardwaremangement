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
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    <style>
        #google_translate_element { display: none !important; }
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon, .goog-te-gadget-simple, .goog-te-menu-value { display: none !important; }
        body { top: 0px !important; }
        #goog-gt-tt { display: none !important; }
        .skiptranslate > iframe { display: none !important; }
    </style>
    <script type="text/javascript">
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'en', 
                includedLanguages: 'hi,bn,mr,te,ta,gu,ur,kn,or,ml,pa,en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
        }
    </script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
    <script>
        window.APP_URL = "{{ config('app.url') }}";
    </script>
</head>
<body>
    <div id="app"></div>
</body>
</html>
