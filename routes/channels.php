<?php

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('transaction.{transaction}', function (User $user, Transaction $transaction): bool {
    return $transaction->isAccessibleBy($user);
});

Broadcast::channel('transaction-ping.{transaction}', function (User $user, Transaction $transaction): bool {
    return $transaction->isAccessibleBy($user);
});
