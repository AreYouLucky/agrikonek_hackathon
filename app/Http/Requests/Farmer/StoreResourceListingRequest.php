<?php

namespace App\Http\Requests\Farmer;

use App\Models\AgriResource;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResourceListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->role === 'farmer'
            && $user->farmerProfile()->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'agri_resource_id' => [
                'required',
                'integer',
                Rule::exists((new AgriResource)->getTable(), 'id'),
            ],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'harvested_at' => ['required', 'date', 'before_or_equal:today'],
            'preservation_method' => [
                'required',
                'string',
                Rule::in([
                    'none',
                    'refrigerated',
                    'dried',
                    'cool_dry_place',
                    'other',
                ]),
            ],
            'img' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'price' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
