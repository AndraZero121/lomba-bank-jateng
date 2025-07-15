<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollRun extends Model
{
    protected $table = 'payroll_run';
    protected $guarded = [];

    public function slipGaji()
    {
        return $this->hasMany(SlipGaji::class, 'id_payroll_run');
    }
}
