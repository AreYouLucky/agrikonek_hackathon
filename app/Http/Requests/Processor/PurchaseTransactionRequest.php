<?php

namespace App\Http\Requests\Processor;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PurchaseTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $transaction = $this->route('transaction');

        return $user instanceof User
            && $user->role === 'processor'
            && $transaction instanceof Transaction
            && $transaction->isAccessibleBy($user);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }
}
