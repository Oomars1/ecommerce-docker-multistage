<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentRequest;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function pay(PaymentRequest $request, Order $order)
    {
        $user = Auth::guard('api')->user();

        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado para pagar esta orden',
            ], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Esta orden ya fue procesada anteriormente',
            ], 422);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $intent = PaymentIntent::create([
                'amount' => (int) round($order->total * 100), // Stripe usa centavos
                'currency' => 'usd',
                'payment_method' => $request->payment_method,
                'confirm' => true,
                'automatic_payment_methods' => [
                    'enabled' => true,
                    'allow_redirects' => 'never',
                ],
            ]);

            $payment = Payment::create([
                'order_id' => $order->id,
                'stripe_payment_id' => $intent->id,
                'amount' => $order->total,
                'currency' => 'usd',
                'status' => $intent->status === 'succeeded' ? 'succeeded' : 'pending',
            ]);

            if ($intent->status === 'succeeded') {
                $order->update(['status' => 'paid']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pago procesado exitosamente',
                'data' => [
                    'order' => $order->fresh(),
                    'payment' => $payment,
                ],
            ]);
        } catch (ApiErrorException $e) {
            Payment::create([
                'order_id' => $order->id,
                'stripe_payment_id' => $e->getStripeCode() ? null : null,
                'amount' => $order->total,
                'currency' => 'usd',
                'status' => 'failed',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage(),
            ], 422);
        }
    }
}