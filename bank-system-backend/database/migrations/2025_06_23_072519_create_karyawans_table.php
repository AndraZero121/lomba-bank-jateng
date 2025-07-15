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
        Schema::create('karyawans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_jabatan')->constrained('jabatans')->onDelete('cascade');
            $table->foreignId('id_departemen')->constrained('departemens')->onDelete('cascade');
            $table->string('email')->unique();
            $table->string('nama_lengkap');
            $table->string('nik_ktp', 16)->unique()->nullable();
            $table->string('npwp', 20)->unique()->nullable();
            $table->string('status_ptkp', 10)->nullable();
            $table->date('tanggal_bergabung')->nullable();
            $table->decimal('gaji_pokok', 15, 2)->nullable();
            $table->string('nomor_rekening', 50)->nullable();
            $table->string('nama_bank', 100)->nullable();
            $table->enum('status_kepegawaian', ['Tetap', 'Kontrak', 'Harian'])->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('karyawans');
    }
};
