<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; }
        .badge { background: #22c55e; color: white; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="color: #dc2626;">🩸 Philippine Red Cross</h2>
        <h3>Congratulations, {{ $user->name }}!</h3>
        <p>Your volunteer application has been <strong>approved</strong>.</p>
        <span class="badge">✔ Approved Volunteer</span>
        <p style="margin-top: 20px;">You can now log in and start your volunteer activities. Welcome to the Red Cross family!</p>
        <div class="footer">This is an automated message. Please do not reply to this email.</div>
    </div>
</body>
</html>