<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departemen extends Model
{
    protected $table = 'departemens';
    protected $guarded = [];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'nama_departemen' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the Karyawan associated with the Departemen.
     */
    public function karyawan()
    {
        return $this->hasMany(Karyawan::class, 'id_departemen');
    }
    /**
     * Get the Jabatan associated with the Departemen.
     */
    public function jabatan()
    {
        return $this->hasMany(Jabatan::class, 'id_departemen');
    }
}
