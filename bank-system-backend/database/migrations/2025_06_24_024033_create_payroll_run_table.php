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
        Schema::create('payroll_run', function (Blueprint $table) {
            $table->id();
            $table->string('periode_gaji', 50)->comment('Format: YYYY-MM')->nullable();
            $table->timestamp('tanggal_eksekusi')->nullable();
            $table->enum('status', ['Draft', 'Final', 'Approve', 'Paid'])->default('Draft')->nullable();
            $table->integer('dieksekusi_oleh')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_run');
    }
};
