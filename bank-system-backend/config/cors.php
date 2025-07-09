<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines which cross-origin requests your
    | application may respond to. It is for configuring calls from
    | JavaScript.
    |
    | When total request paths are matched (including wildcards), the first
    | array will apply. The first option to match a path will be used, so
    | you should put your most specific paths at the top.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'], // ATAU GANTI DENGAN DOMAIN FRONTEND SPESIFIK KAMU

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];