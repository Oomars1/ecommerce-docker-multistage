<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(OrderRequest $request)
    {
        $user = Auth::guard('api')->user();

        $order = DB::transaction(function () use ($request, $user) {
            $total = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    abort(422, "Stock insuficiente para el producto: {$product->name}");
                }

                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;

                $itemsData[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                ];
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => 'pending',
            ]);

            foreach ($itemsData as $data) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $data['product']->id,
                    'quantity' => $data['quantity'],
                    'unit_price' => $data['unit_price'],
                ]);

                $data['product']->decrement('stock', $data['quantity']);
            }

            return $order;
        });

        return response()->json([
            'success' => true,
            'message' => 'Orden creada exitosamente',
            'data' => $order->load('items.product'),
        ], 201);
    }

    public function show(Order $order)
    {
        $user = Auth::guard('api')->user();

        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado para ver esta orden',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order->load('items.product', 'payment'),
        ]);
    }

    public function index()
    {
        $user = Auth::guard('api')->user();

        $query = $user->orders()->with('items.product', 'payment')->latest();

        if (request()->has('status')) {
            $query->where('status', request('status'));
        }

        $orders = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }
}
