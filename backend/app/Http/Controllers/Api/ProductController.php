<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('is_active', true)->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function store(ProductRequest $request)
    {
        $product = Product::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Producto creado exitosamente',
            'data' => $product,
        ], 201);
    }

    public function update(ProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado exitosamente',
            'data' => $product,
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado exitosamente',
        ]);
    }
}