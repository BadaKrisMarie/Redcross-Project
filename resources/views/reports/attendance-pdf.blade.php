<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Attendance Manifest</title>
    <style>
        @page {
            margin: 24px 28px;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1a1a1a;
        }

        .header {
            display: table;
            width: 100%;
            margin-bottom: 6px;
        }

        .header .org {
            display: table-cell;
            vertical-align: middle;
        }

        .header .org-name {
            font-size: 15px;
            font-weight: bold;
            color: #ce1126;
            margin: 0;
        }

        .header .org-sub {
            font-size: 9px;
            color: #666;
            margin: 0;
        }

        h1 {
            font-size: 16px;
            margin: 10px 0 2px;
            letter-spacing: 0.5px;
        }

        .range {
            font-size: 10px;
            color: #444;
            margin-bottom: 12px;
        }

        .totals {
            display: table;
            width: 100%;
            margin-bottom: 14px;
        }

        .totals .cell {
            display: table-cell;
            width: 25%;
            border: 1px solid #e2e2e2;
            padding: 6px 8px;
            text-align: center;
        }

        .totals .cell .num {
            font-size: 14px;
            font-weight: bold;
            display: block;
        }

        .totals .cell .label {
            font-size: 8px;
            color: #777;
            text-transform: uppercase;
        }

        table.records {
            width: 100%;
            border-collapse: collapse;
        }

        table.records th {
            background: #ce1126;
            color: #fff;
            text-align: left;
            padding: 6px 6px;
            font-size: 9px;
            text-transform: uppercase;
        }

        table.records td {
            padding: 5px 6px;
            border-bottom: 1px solid #eee;
            font-size: 9.5px;
        }

        table.records tr:nth-child(even) {
            background: #fafafa;
        }

        .badge {
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: capitalize;
        }

        .status-present { background: #dcfce7; color: #166534; }
        .status-ongoing { background: #fef3c7; color: #92400e; }
        .status-absent  { background: #f3f4f6; color: #6b7280; }
        .status-flagged { background: #ede9fe; color: #5b21b6; }

        .footer {
            margin-top: 16px;
            font-size: 8px;
            color: #999;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="org">
            <p class="org-name">Philippine Red Cross</p>
            <p class="org-sub">Rizal Chapter &middot; Muntinlupa City Branch</p>
        </div>
    </div>

    <h1>ATTENDANCE MANIFEST</h1>
    <div class="range">{{ \Carbon\Carbon::parse($from)->format('M d, Y') }} &ndash; {{ \Carbon\Carbon::parse($to)->format('M d, Y') }}</div>

    <div class="totals">
        <div class="cell">
            <span class="num">{{ $totals['volunteers'] }}</span>
            <span class="label">Volunteers</span>
        </div>
        <div class="cell">
            <span class="num">{{ $totals['present'] }}</span>
            <span class="label">Present</span>
        </div>
        <div class="cell">
            <span class="num">{{ $totals['absent'] }}</span>
            <span class="label">Absent</span>
        </div>
        <div class="cell">
            <span class="num">{{ $totals['flagged'] }}</span>
            <span class="label">Flagged</span>
        </div>
    </div>

    <table class="records">
        <thead>
            <tr>
                <th>Volunteer</th>
                <th>Activity</th>
                <th>Time In / Out</th>
                <th>Geofence</th>
                <th>Method</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($records as $r)
                <tr>
                    <td>{{ $r['name'] }}<br><span style="color:#999;font-size:8px;">{{ $r['id'] }}</span></td>
                    <td>{{ $r['activity'] }}</td>
                    <td>{{ $r['timeIn'] }} &mdash; {{ $r['timeOut'] }}</td>
                    <td>{{ ucfirst($r['geofence']) }}</td>
                    <td>{{ ucfirst($r['scan']) }}</td>
                    <td><span class="badge status-{{ $r['status'] }}">{{ $r['status'] }}</span></td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align:center;color:#999;padding:16px;">No records found for this date range.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">Generated {{ $generatedAt }}</div>
</body>
</html>