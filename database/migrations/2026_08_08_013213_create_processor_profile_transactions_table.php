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
        Schema::create('processor_profile_transactions', function (Blueprint $table) {
            $table->id();
            $table->integer('processor_profile_id');
            $table->foreignId('processor_profile_id')->constrained('processor_profiles')->onDelete('cascade');

            $table->integer('agri_resource_id');
            $table->foreignId('agri_resource_id')->constrained('agri_resources')->onDelete('cascade');

            $table->double('quantity')->default(0);
            $table->double('price')->default(0);
            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processor_profile_transactions');
    }
};
