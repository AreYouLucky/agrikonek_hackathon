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
        Schema::table('resource_listings', function (Blueprint $table) {
            $table->decimal('estimated_price', 10, 2)->nullable()->after('price');
            $table->date('fresh_until')->nullable()->after('estimated_price');
            $table->string('freshness_status', 30)->nullable()->after('fresh_until');
            $table->text('ai_analysis_message')->nullable()->after('freshness_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resource_listings', function (Blueprint $table) {
            $table->dropColumn([
                'estimated_price',
                'fresh_until',
                'freshness_status',
                'ai_analysis_message',
            ]);
        });
    }
};
