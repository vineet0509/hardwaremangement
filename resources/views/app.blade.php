<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18169650337"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-18169650337');
    </script>
    <title>Hardware Pro by Vynkra Technologies | Multi-Tenant POS & Inventory Software</title>
    <meta name="description" content="Launch and scale your hardware business with Hardware Pro by Vynkra Technologies - the most powerful multi-tenant management solution. Manage shops, invoices, khata ledgers, staff payroll, and business audits dynamically.">
    <meta name="author" content="Vynkra Technologies">
    <meta name="keywords" content="hardware shop software, billing system, khata book for stores, saas retail, multi tenant POS, stock controller, inventory management, staff payments, Vynkra, Vynkra Technologies">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Hardware Pro by Vynkra Technologies | Multi-Tenant POS & Inventory Software">
    <meta property="og:description" content="Complete billing, POS and hardware shop store analytics suite powered by Vynkra Technologies. Multi-tenant access with simple controls.">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="Hardware Pro by Vynkra Technologies | Multi-Tenant POS & Inventory Software">
    <meta property="twitter:description" content="Manage multiple storefronts seamlessly with our custom hardware management platform engineered by Vynkra Technologies.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    
    <!-- PWA Manifest & Icons disabled to prevent the browser from asking the user to install the site as desktop software -->
    <!-- <link rel="manifest" href="/manifest.json"> -->
    <!-- <meta name="theme-color" content="#4f46e5"> -->
    <!-- <link rel="apple-touch-icon" href="/icon-192x192.png"> -->
    
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    <script>
        window.API_URL = "{{ url('/api') }}";

        // Prevent standard beforeinstallprompt event from showing browser install dialogs
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            return false;
        });

        // Actively unregister any registered service workers to disable PWA desktop install options and avoid caching issues
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) {
                    registration.unregister().then(function(success) {
                        if (success) {
                            console.log('Existing ServiceWorker successfully unregistered.');
                        }
                    });
                }
            }).catch(function(err) {
                console.log('ServiceWorker unregistration failed: ', err);
            });
        }
    </script>
</head>
<body>
    <div id="app"></div>
    <div id="google_translate_element" style="display:none"></div>
    <script type="text/javascript">
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
            }, 'google_translate_element');
        }
    </script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" defer></script>
</body>
</html>
