<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - VyaparSync</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --bg: #f8fafc;
            --surface: #ffffff;
            --text: #1e293b;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --code-bg: #1e293b;
            --code-text: #e2e8f0;
        }

        body {
            font-family: 'Roboto', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        header {
            background: linear-gradient(135deg, var(--primary), #06b6d4);
            color: white;
            padding: 60px 20px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        h1 { margin: 0; font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em; }
        p.subtitle { opacity: 0.9; font-size: 1.1rem; margin-top: 10px; }

        .container {
            max-width: 1200px;
            margin: -40px auto 60px;
            padding: 0 20px;
        }

        .route-card {
            background: var(--surface);
            border-radius: 16px;
            border: 1px solid var(--border);
            margin-bottom: 30px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }

        .route-card:hover { transform: translateY(-4px); }

        .route-header {
            padding: 20px 30px;
            background: #f1f5f9;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .method {
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 0.8rem;
            text-transform: uppercase;
        }

        .method.GET { background: #dcfce7; color: #166534; }
        .method.POST { background: #e0e7ff; color: #3730a3; }
        .method.PUT, .method.PATCH { background: #fef3c7; color: #92400e; }
        .method.DELETE { background: #fee2e2; color: #991b1b; }

        .uri { font-family: monospace; font-size: 1.1rem; font-weight: 600; color: var(--text); }

        .route-body { padding: 30px; }

        .section-title { font-size: 0.9rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 15px; display: block; }

        pre {
            background: var(--code-bg);
            color: var(--code-text);
            padding: 20px;
            border-radius: 10px;
            overflow-x: auto;
            font-size: 0.9rem;
            margin: 0 0 20px 0;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
        }

        .badge {
            background: #f1f5f9;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <header>
        <h1>API Documentation</h1>
        <p class="subtitle">VyaparSync Management System - Technical Reference</p>
    </header>

    <div class="container">
        @foreach($routes as $route)
            <div class="route-card">
                <div class="route-header">
                    <span class="method {{ explode(', ', $route['method'])[0] }}">{{ $route['method'] }}</span>
                    <span class="uri">{{ $route['uri'] }}</span>
                    <div style="margin-left: auto;">
                        @foreach($route['middleware'] as $mw)
                            <span class="badge">{{ $mw }}</span>
                        @endforeach
                    </div>
                </div>
                <div class="route-body">
                    <div class="grid">
                        <div>
                            <span class="section-title">Request Body / Params</span>
                            @if($route['payload'])
                                <pre>{{ json_encode($route['payload'], JSON_PRETTY_PRINT) }}</pre>
                            @elseif($route['params'])
                                <p style="color: var(--text-muted);">URI Parameters: {{ implode(', ', $route['params']) }}</p>
                            @else
                                <p style="color: var(--text-muted);">No request body required.</p>
                            @endif
                        </div>
                        <div>
                            <span class="section-title">Success Response Example</span>
                            <pre>{{ json_encode($route['response_example'], JSON_PRETTY_PRINT) }}</pre>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</body>
</html>
