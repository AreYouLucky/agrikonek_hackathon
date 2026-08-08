<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\MarketPrice;
use App\Models\Message;
use App\Models\ProcessorProfile;
use App\Models\ProcessorProfileTransaction;
use App\Models\ResourceListing;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Tests\TestCase;

class ModelRelationshipTest extends TestCase
{
    public function test_models_expose_the_relationships_defined_by_the_schema(): void
    {
        $this->assertInstanceOf(HasOne::class, (new User)->farmerProfile());
        $this->assertInstanceOf(HasOne::class, (new User)->processorProfile());
        $this->assertInstanceOf(HasMany::class, (new FarmerProfile)->resourceListings());
        $this->assertInstanceOf(BelongsTo::class, (new ResourceListing)->farmerProfile());
        $this->assertInstanceOf(BelongsTo::class, (new ResourceListing)->agriResource());
        $this->assertInstanceOf(HasMany::class, (new AgriResource)->resourceListings());
        $this->assertInstanceOf(HasMany::class, (new AgriResource)->marketPrices());
        $this->assertInstanceOf(HasMany::class, (new AgriResource)->processorDemands());
        $this->assertInstanceOf(BelongsTo::class, (new Transaction)->resourceListing());
        $this->assertInstanceOf(BelongsTo::class, (new Transaction)->processorProfile());
        $this->assertInstanceOf(HasMany::class, (new Transaction)->messages());
        $this->assertInstanceOf(BelongsTo::class, (new MarketPrice)->agriResource());
        $this->assertInstanceOf(BelongsTo::class, (new Message)->transaction());
        $this->assertInstanceOf(BelongsTo::class, (new Message)->sender());
        $this->assertInstanceOf(BelongsTo::class, (new ProcessorProfileTransaction)->user());
        $this->assertInstanceOf(BelongsTo::class, (new ProcessorProfileTransaction)->processorProfile());
        $this->assertInstanceOf(BelongsTo::class, (new ProcessorProfileTransaction)->agriResource());
        $this->assertInstanceOf(HasMany::class, (new ProcessorProfile)->resourceDemands());
    }

    public function test_models_cast_schema_values_to_their_expected_types(): void
    {
        $this->assertSame('float', (new ResourceListing)->getCasts()['quantity']);
        $this->assertSame('datetime', (new ResourceListing)->getCasts()['havested_at']);
        $this->assertSame('float', (new ResourceListing)->getCasts()['estimated_price']);
        $this->assertSame('date', (new ResourceListing)->getCasts()['fresh_until']);
        $this->assertSame('float', (new Transaction)->getCasts()['price']);
        $this->assertSame('float', (new MarketPrice)->getCasts()['price']);
        $this->assertSame('boolean', (new Message)->getCasts()['is_img']);
        $this->assertSame('float', (new ProcessorProfileTransaction)->getCasts()['quantity']);
        $this->assertSame('float', (new ProcessorProfileTransaction)->getCasts()['price']);
    }
}
