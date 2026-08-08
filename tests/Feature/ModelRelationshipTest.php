<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\MarketPrice;
use App\Models\Message;
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
        $this->assertInstanceOf(HasMany::class, (new AgriResource)->transactions());
        $this->assertInstanceOf(HasMany::class, (new AgriResource)->marketPrices());
        $this->assertInstanceOf(BelongsTo::class, (new Transaction)->agriResource());
        $this->assertInstanceOf(HasMany::class, (new Transaction)->messages());
        $this->assertInstanceOf(BelongsTo::class, (new MarketPrice)->agriResource());
        $this->assertInstanceOf(BelongsTo::class, (new Message)->transaction());
        $this->assertInstanceOf(BelongsTo::class, (new Message)->sender());
    }

    public function test_models_cast_schema_values_to_their_expected_types(): void
    {
        $this->assertSame('float', (new ResourceListing)->getCasts()['quantity']);
        $this->assertSame('datetime', (new ResourceListing)->getCasts()['havested_at']);
        $this->assertSame('float', (new Transaction)->getCasts()['price']);
        $this->assertSame('float', (new MarketPrice)->getCasts()['price']);
        $this->assertSame('boolean', (new Message)->getCasts()['is_img']);
    }
}
