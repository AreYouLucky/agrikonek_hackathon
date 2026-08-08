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
        Schema::create('farmer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('farm_name');
            $table->string('farm_complete_address');
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
            $table->string('contact_number');
            $table->timestamps();
        });
    }

//     ├── id
// ├── user_id
// ├── farm_name
// ├── farm_location
// ├── barangay
// ├── contact_number
// ├── created_at
// └── updated_at

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farmer_profiles');
    }
};
