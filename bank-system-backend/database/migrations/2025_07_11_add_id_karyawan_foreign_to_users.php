<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && Schema::hasTable('karyawans')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'id_karyawan')) {
                    $table->foreignId('id_karyawan')->nullable()->constrained('karyawans')->onDelete('set null');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'id_karyawan')) {
                    $table->dropForeign(['id_karyawan']);
                    $table->dropColumn('id_karyawan');
                }
            });
        }
    }
};
