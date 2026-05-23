<?php

return [

    'relying_party' => [
        'name' => env('APP_NAME', 'Red Cross'),
        'id'   => 'localhost',
    ],

    'origins' => env('WEBAUTHN_ORIGINS'),

    'challenge' => [
        'bytes' => 16,
        'timeout' => 60,
        'key' => '_webauthn',
    ],
];