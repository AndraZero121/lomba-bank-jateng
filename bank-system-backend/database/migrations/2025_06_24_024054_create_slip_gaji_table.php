<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('slip_gaji', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_payroll_run')->constrained('payroll_run')->onDelete('cascade');
            $table->foreignId('id_karyawan')->constrained('karyawans')->onDelete('cascade');
            $table->decimal('gaji_pokok', 15, 2)->nullable();
            $table->decimal('total_tunjangan', 15, 2)->default(0)->nullable();
            $table->decimal('total_potongan', 15, 2)->default(0)->nullable();
            $table->decimal('penghasilan_bruto', 15, 2)->default(0)->nullable();
            $table->decimal('pph21_terpotong', 15, 2)->default(0)->nullable();
            $table->decimal('total_iuran_bpjs_kesehatan', 15, 2)->default(0)->nullable();
            $table->decimal('thp', 20, 2)->default(0)->nullable();
            $table->json('detail_json')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slip_gaji');
    }
};
