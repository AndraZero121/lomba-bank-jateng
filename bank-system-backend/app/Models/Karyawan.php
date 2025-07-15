<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    protected $table = 'karyawans';
    protected $guarded = [];

    public function departemen()
    {
        return $this->belongsTo(Departemen::class, 'id_departemen');
    }
    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class, 'id_jabatan');
    }

    public function slipGaji()
    {
        return $this->hasMany(SlipGaji::class, "id_karyawan");
    }
}
