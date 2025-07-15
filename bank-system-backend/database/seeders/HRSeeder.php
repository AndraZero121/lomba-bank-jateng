<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HRSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         \App\Models\User::create([
            'name' => 'HR',
            'email' => 'hrsipena@gmail.com',
            'password' => bcrypt('password'),
            'roles' => 'HR',
        ]);
    }
}
