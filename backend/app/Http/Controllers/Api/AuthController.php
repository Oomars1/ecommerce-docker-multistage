<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use OpenApi\Annotations as OA;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/auth/register",
     *     summary="Registrar un nuevo cliente",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="Juan Perez"),
     *             @OA\Property(property="email", type="string", format="email", example="juan@test.com"),
     *             @OA\Property(property="password", type="string", format="password", example="12345678"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="12345678"),
     *             @OA\Property(property="phone", type="string", example="70001111"),
     *             @OA\Property(property="address", type="string", example="San Salvador, El Salvador")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Usuario registrado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        $token = Auth::guard('api')->login($user);

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data' => [
                'user' => $user,
                'authorization' => [
                    'token' => $token,
                    'type' => 'bearer',
                ],
            ],
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/auth/login",
     *     summary="Iniciar sesión",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="juan@test.com"),
     *             @OA\Property(property="password", type="string", format="password", example="12345678")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Login exitoso"),
     *     @OA\Response(response=401, description="Credenciales incorrectas")
     * )
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login exitoso',
            'data' => [
                'user' => Auth::guard('api')->user(),
                'authorization' => [
                    'token' => $token,
                    'type' => 'bearer',
                ],
            ],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/auth/logout",
     *     summary="Cerrar sesión",
     *     tags={"Auth"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Sesión cerrada exitosamente"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function logout()
    {
        Auth::guard('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/auth/me",
     *     summary="Obtener datos del usuario autenticado",
     *     tags={"Auth"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Datos del usuario"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function me()
    {
        return response()->json([
            'success' => true,
            'data' => Auth::guard('api')->user(),
        ]);
    }
}