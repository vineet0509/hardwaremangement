<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bill #{{ $bill->bill_number }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; padding: 20px; color: #333; font-size: 12px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .shop-info { float: left; width: 60%; }
        .bill-info { float: right; width: 35%; text-align: right; }
        .clear { clear: both; }
        .customer-section { margin-bottom: 20px; padding: 10px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #eee; padding: 8px; border: 1px solid #ddd; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        .text-right { text-align: right; }
        .summary { float: right; width: 250px; }
        .summary table { border: none; }
        .summary td { border: none; padding: 4px 8px; }
        .total-row { font-weight: bold; font-size: 14px; border-top: 1px solid #333 !important; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #777; }
    </style>
</head>
<body>
    <div class="header">
        <div class="shop-info">
            <h1 style="margin: 0; font-size: 20px;">{{ $settings->company_name ?? 'Hardware Business' }}</h1>
            <p style="margin: 5px 0;">{{ $settings->company_address ?? '' }}</p>
            <p style="margin: 5px 0;">Phone: {{ $settings->company_phone ?? '' }}</p>
            @if($bill->is_gst && $shop->gst_number)
                <p style="margin: 5px 0;"><strong>GSTIN: {{ $shop->gst_number }}</strong></p>
            @endif
        </div>
        <div class="bill-info">
            <h2 style="margin: 0; color: #666;">{{ $bill->is_gst ? 'TAX INVOICE' : 'RETAIL INVOICE' }}</h2>
            <p><strong>Bill No:</strong> {{ $bill->bill_number }}</p>
            <p><strong>Date:</strong> {{ $bill->created_at->format('d/m/Y H:i') }}</p>
        </div>
        <div class="clear"></div>
    </div>

    <div class="customer-section">
        <h3 style="margin: 0 0 5px 0; font-size: 14px;">Bill To:</h3>
        <p style="margin: 3px 0;"><strong>{{ $bill->customer_name }}</strong></p>
        <p style="margin: 3px 0;">{{ $bill->customer_phone }}</p>
        <p style="margin: 3px 0;">{{ $bill->customer_address }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Items / Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bill->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->product_name }}</strong>
                        @if($item->description)
                            <br><small style="color: #666;">{{ $item->description }}</small>
                        @endif
                    </td>
                    <td class="text-right">{{ $item->quantity }} {{ $item->unit }}</td>
                    <td class="text-right">₹{{ number_format($item->price, 2) }}</td>
                    <td class="text-right">₹{{ number_format($item->total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">₹{{ number_format($bill->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td>Discount:</td>
                <td class="text-right">- ₹{{ number_format($bill->discount, 2) }}</td>
            </tr>
            @if($bill->is_gst)
                <tr>
                    <td>CGST:</td>
                    <td class="text-right">₹{{ number_format($bill->tax / 2, 2) }}</td>
                </tr>
                <tr>
                    <td>SGST:</td>
                    <td class="text-right">₹{{ number_format($bill->tax / 2, 2) }}</td>
                </tr>
            @endif
            <tr class="total-row">
                <td>Total:</td>
                <td class="text-right">₹{{ number_format($bill->total, 2) }}</td>
            </tr>
            <tr>
                <td>Paid Amount:</td>
                <td class="text-right">₹{{ number_format($bill->paid_amount, 2) }}</td>
            </tr>
            @if($bill->due_amount > 0)
                <tr style="color: red;">
                    <td><strong>Balance Due:</strong></td>
                    <td class="text-right"><strong>₹{{ number_format($bill->due_amount, 2) }}</strong></td>
                </tr>
            @endif
        </table>
    </div>
    <div class="clear"></div>

    <div class="footer">
        <p>This is a computer generated invoice. No signature required.</p>
        <p><strong>Terms & Conditions:</strong> {{ $business->terms ?? 'Thank you for your business!' }}</p>
    </div>
</body>
</html>
