<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="API de E-commerce Segura",
 *     version="1.0.0",
 *     description="API RESTful para gestión de e-commerce: clientes, catálogo de productos, órdenes de compra y pagos con Stripe."
 * )
 *
 * @OA\Server(
 *     url="http://127.0.0.1:8000/api",
 *     description="Servidor local de desarrollo"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
abstract class Controller
{
    //
}