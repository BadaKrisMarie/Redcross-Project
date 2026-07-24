<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; }
        .badge { background: #dc2626; color: white; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="color: #dc2626;">Philippine Red Cross</h2>
        <h3>Hello, {{ $user->name }},</h3>
        <p>We are writing to let you know that your volunteer account with the <strong>Philippine Red Cross - Muntinlupa Chapter</strong> has been <strong>removed</strong> from our system.</p>
        <span class="badge">Account Removed</span>
        <p style="margin-top: 20px;">If you believe this was done in error, or if you have any questions, please reach out to our office directly.</p>
        <div class="footer">This is an automated message. Please do not reply to this email.</div>
    </div>
</body>
</html>
