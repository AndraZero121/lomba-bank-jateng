<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KaryawanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'name' => 'karyawan',
            'email' => 'karyawansipena@gmail.com',
            'password' => bcrypt('password'),
            'roles' => 'Karyawan',
        ]);
    }
}
