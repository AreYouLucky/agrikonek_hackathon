<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AnalyzeCropPriceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->role === 'farmer';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'weight' => ['required', 'numeric', 'gt:0'],
            'harvested_at' => ['required', 'date'],
            'preservation_method' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'gt:0'],
            'farmer_location' => ['nullable', 'string', 'max:500'],
            'market_area' => ['nullable', 'string', 'max:255'],
            'market_average' => ['nullable', 'numeric', 'min:0'],
            'market_minimum' => ['nullable', 'numeric', 'min:0'],
            'market_maximum' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
