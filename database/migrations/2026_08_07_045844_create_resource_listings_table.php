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
        Schema::create('resource_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_profile_id')->constrained('farmer_profiles')->onDelete('cascade');
            $table->foreignId('agri_resource_id')->constrained('agri_resources')->onDelete('cascade');
            $table->double('quantity')->nullable();
            $table->dateTime('havested_at');
            $table->string('preservation_method');
            $table->string('img')->nullable();
            $table->double('price')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resource_listings');
    }
};
