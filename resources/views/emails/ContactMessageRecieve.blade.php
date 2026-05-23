<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f8f8f8; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: #CC1F1F; padding: 28px 36px; }
        .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 32px 36px; }
        .field { margin-bottom: 20px; }
        .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 4px; }
        .value { font-size: 15px; color: #1c1c1c; line-height: 1.6; }
        .message-box { background: #f8f8f8; border-left: 3px solid #CC1F1F; padding: 14px 18px; border-radius: 4px; font-size: 14px; color: #444; line-height: 1.75; }
        .footer { padding: 20px 36px; border-top: 1px solid #eee; font-size: 12px; color: #aaa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Message</h1>
            <p>Philippine Red Cross – Muntinlupa City Branch</p>
        </div>
        <div class="body">
            <div class="field">
                <div class="label">From</div>
                <div class="value">{{ $contactMessage->name }}</div>
            </div>
            <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:{{ $contactMessage->email }}" style="color:#CC1F1F;">{{ $contactMessage->email }}</a></div>
            </div>
            <div class="field">
                <div class="label">Message</div>
                <div class="message-box">{{ $contactMessage->message }}</div>
            </div>
        </div>
        <div class="footer">
            Received on {{ $contactMessage->created_at->format('F j, Y \a\t g:i A') }} · Philippine Red Cross Muntinlupa
        </div>
    </div>
</body>
</html>