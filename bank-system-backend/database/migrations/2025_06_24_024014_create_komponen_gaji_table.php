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
        Schema::create('komponen_gaji', function (Blueprint $table) {
            $table->id();
            $table->string('nama_komponen', 100)->nullable();
            $table->enum('tipe', ['Tunjangan', 'Potongan'])->default('Tunjangan')->nullable();
            $table->enum('sifat', ['Tetap', 'Tidak Tetap'])->default('Tetap')->nullable();
            $table->boolean('is_taxable')->default(0)->nullable();
            $table->boolean('is_bpjs_base')->default(0)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('komponen_gaji');
    }
};
