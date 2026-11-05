<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Sin factories: Faker es dependencia de desarrollo y no existe en la imagen de producción.
     */
    public function run(): void
    {
        // Idempotente: no duplica productos si ya existen.
        if (DB::table('products')->count() > 0) {
            return;
        }

        $now = now();

        $products = [
            ['Laptop Pro 14"', 'Laptop ligera con 16 GB de RAM y SSD de 512 GB.', 1299.99, 15],
            ['Mouse Inalámbrico', 'Mouse ergonómico con receptor USB y batería de larga duración.', 24.99, 120],
            ['Teclado Mecánico', 'Teclado mecánico con switches rojos y retroiluminación.', 79.90, 60],
            ['Monitor 27" 4K', 'Monitor IPS 4K con soporte ajustable en altura.', 389.00, 25],
            ['Auriculares Bluetooth', 'Auriculares con cancelación de ruido y 30 horas de batería.', 149.50, 40],
            ['Webcam Full HD', 'Cámara 1080p con micrófono integrado.', 54.99, 80],
            ['Disco SSD 1 TB', 'Unidad de estado sólido NVMe de alta velocidad.', 99.00, 70],
            ['Hub USB-C 7 en 1', 'Hub con HDMI, USB 3.0, lector SD y carga rápida.', 39.99, 100],
        ];

        foreach ($products as [$name, $description, $price, $stock]) {
            DB::table('products')->insert([
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'stock' => $stock,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}