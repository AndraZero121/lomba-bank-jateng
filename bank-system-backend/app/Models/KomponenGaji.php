<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class KomponenGaji extends Model
{

    protected $table = 'komponen_gaji';

    protected $guarded = [];

    protected $casts = [
        'is_taxable' => 'boolean',
        'is_bpjs_base' => 'boolean',
    ];
}
