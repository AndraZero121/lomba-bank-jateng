<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlipGaji extends Model
{
    protected $table = 'slip_gaji';
    protected $guarded = [];

    public function payrollRun()
    {
        return $this->belongsTo(PayrollRun::class, 'id_payroll_run');
    }
    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan');
    }
}
