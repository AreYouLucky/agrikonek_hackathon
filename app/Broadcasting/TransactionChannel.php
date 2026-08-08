<?php

namespace App\Broadcasting;

use App\Models\Transaction;
use App\Models\User;

class TransactionChannel
{
    public function join(User $user, int $transactionId): bool
    {
        $transaction = Transaction::query()->find($transactionId);
        if (! $transaction) {
            return false;
        }

        return true;

        // return $transaction?->isAccessibleBy($user) ?? false;
    }
}
