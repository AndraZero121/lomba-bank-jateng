<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    protected $table = 'jabatans';
    protected $guarded = [];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the Karyawan associated with the Jabatan.
     */
    public function karyawan()
    {
        return $this->hasMany(Karyawan::class, 'id_jabatan');
    }
    /**
     * Get the Departemen associated with the Jabatan.
     */
    public function departemen()
    {
        return $this->hasMany(Departemen::class, 'id_jabatan');
    }
}
