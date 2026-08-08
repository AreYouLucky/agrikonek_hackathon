<?php

namespace App\Http\Requests\Processor;

use App\Models\AgriResource;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMyDemandRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->role === 'processor'
            && $user->processorProfile()->exists();
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
            'price' => ['required', 'numeric', 'gte:0'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
