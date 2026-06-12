<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- ═══════════════════════════════════════════════════════
         PRIMARY SEO META TAGS
    ═══════════════════════════════════════════════════════ -->
    <title>VyaparSync – Free Billing, POS & Inventory Software for Indian Shops</title>

    <meta name="description" content="VyaparSync is a free online billing, POS & inventory management software for Indian hardware shops, kirana stores & small businesses. Manage stock, GST invoices, khata, staff payroll & more — all in one place.">

    <meta name="keywords" content="VyaparSync, billing software india, free POS software, inventory management software, hardware shop billing, kirana store software, GST billing software, khata book online, stock management software, invoice software india, small business software, vyapar alternative, shop management system, staff payroll software, udhar khata digital">

    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="author" content="VyaparSync by Vynkra Technologies">
    <meta name="theme-color" content="#14b8a6">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="VyaparSync">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <!-- Canonical URL -->
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Sitemap reference -->
    <link rel="sitemap" type="application/xml" href="{{ url('/sitemap.xml') }}">

    <!-- ═══════════════════════════════════════════════════════
         OPEN GRAPH (Facebook, WhatsApp, LinkedIn, etc.)
    ═══════════════════════════════════════════════════════ -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="VyaparSync">
    <meta property="og:locale" content="en_IN">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="VyaparSync – Free Billing, POS & Inventory Software for Indian Shops">
    <meta property="og:description" content="Free billing & POS software for Indian hardware shops, kirana stores & small businesses. GST invoices, khata book, stock management, staff payroll — all in one place.">
    <meta property="og:image" content="{{ asset('logo.jpg') }}">
    <meta property="og:image:alt" content="VyaparSync — Billing & Inventory Software">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- ═══════════════════════════════════════════════════════
         TWITTER / X CARD
    ═══════════════════════════════════════════════════════ -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@@VyaparSync">
    <meta name="twitter:creator" content="@@VynkraTech">
    <meta name="twitter:title" content="VyaparSync – Free Billing & POS for Indian Shops">
    <meta name="twitter:description" content="GST invoices, khata book, stock control, staff payroll — all free for Indian small businesses.">
    <meta name="twitter:image" content="{{ asset('logo.jpg') }}">

    <!-- ═══════════════════════════════════════════════════════
         SCHEMA.ORG JSON-LD — Structured Data for Google Rich Results
    ═══════════════════════════════════════════════════════ -->
    @verbatim
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "VyaparSync",
      "url": "https://vyaparsync.vynkra.in/",
      "logo": "https://vyaparsync.vynkra.in/logo.jpg",
      "description": "VyaparSync is a free billing, POS and inventory management software designed for Indian hardware shops, kirana stores and small businesses. Features include GST invoicing, digital khata book, stock management, staff payroll, and multi-branch support.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, Android, iOS",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "featureList": [
        "GST Invoice Generation",
        "Point of Sale (POS) Billing",
        "Inventory & Stock Management",
        "Digital Khata / Udhar Ledger",
        "Staff Payroll Management",
        "Multi-branch Business Management",
        "Quotation & Estimate Generation",
        "Customer & Supplier Management",
        "Expense Tracking",
        "Business Reports & Analytics"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "120"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Vynkra Technologies",
        "url": "https://vyaparsync.vynkra.in/"
      }
    }
    </script>
    @endverbatim

    <!-- ═══════════════════════════════════════════════════════
         FONTS & ASSETS
    ═══════════════════════════════════════════════════════ -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

    <!-- Favicon & App Icons -->
    <link rel="icon" type="image/png" href="{{ asset('logo.jpg') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('logo.jpg') }}">
    <link rel="icon" type="image/png" sizes="192x192" href="{{ asset('icon-192x192.png') }}">
    <link rel="icon" type="image/png" sizes="512x512" href="{{ asset('icon-512x512.png') }}">

    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">

    <!-- Google Ads / Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18169650337"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-18169650337', {'allow_enhanced_conversions': true});
    </script>

    @viteReactRefresh
    @vite(['resources/js/app.jsx'])

    <script>
        window.API_URL = "{{ url('/api') }}";

        // Prevent PWA install prompt
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            return false;
        });

        // Unregister old service workers
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) {
                    registration.unregister();
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

