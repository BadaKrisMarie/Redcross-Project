<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #CC0000; padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; }
        .body { padding: 32px; }
        .body h2 { color: #111; font-size: 20px; margin-top: 0; }
        .body p { color: #555; line-height: 1.7; }
        .badge { display: inline-block; background: #FEF9C3; color: #854D0E; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 16px 0; }
        .footer { background: #f9f9f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✚ Red Cross Volunteers</h1>
            <p>Rizal Chapter — Muntinlupa City Branch</p>
        </div>
        <div class="body">
            <h2>Hello, {{ $volunteer->name }}!</h2>
            <span class="badge">⏳ Pending Approval</span>
            <p>Thank you for registering as a volunteer with the Philippine Red Cross — Rizal Chapter!</p>
            <p>Your application has been successfully received and is currently <strong>pending review</strong> by our admin team.</p>
            <p>You will receive another email once your application has been approved or reviewed.</p>
            <p>Thank you for your patience and your willingness to serve!</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Philippine Red Cross — Rizal Chapter. All rights reserved.
        </div>
    </div>
</body>
</html>