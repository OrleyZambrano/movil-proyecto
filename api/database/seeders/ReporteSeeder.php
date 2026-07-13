<?php

namespace Database\Seeders;

use App\Models\Reporte;
use App\Models\Comentario;
use App\Models\HistorialEstado;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReporteSeeder extends Seeder
{
    public function run(): void
    {
        $ciudadano = User::where('rol', 'ciudadano')->first();
        $funcionario = User::where('rol', 'funcionario')->first();

        // --- 1 ---
        $r1 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => null,
            'categoria_id' => 1,
            'titulo' => 'Bache profundo en el Malecón',
            'descripcion' => 'Hay un bache grande y peligroso frente al malecón de Manta, varios carros han pinchado llantas. Necesita reparación urgente antes de que cause un accidente grave.',
            'latitud' => '-0.9498',
            'longitud' => '-80.7308',
            'direccion' => 'Malecón de Manta, frente al hotel Oro Verde',
            'prioridad' => 4,
            'estado' => 'pendiente',
        ]);
        HistorialEstado::create(['reporte_id' => $r1->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);

        // --- 2 ---
        $r2 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => $funcionario->id,
            'categoria_id' => 3,
            'titulo' => 'Postes sin luz en Tarqui',
            'descripcion' => 'Tres postes de luz no funcionan en la calle principal de Tarqui desde hace 5 días, la zona queda completamente oscura de noche. Peligroso para los vecinos que transitan en la noche. Ya hubo un asalto.',
            'latitud' => '-0.9335',
            'longitud' => '-80.7365',
            'direccion' => 'Calle 13, barrio Tarqui, Manta',
            'prioridad' => 5,
            'estado' => 'en_proceso',
        ]);
        HistorialEstado::create(['reporte_id' => $r2->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);
        HistorialEstado::create(['reporte_id' => $r2->id, 'usuario_id' => $funcionario->id, 'estado' => 'en_revision', 'comentario' => 'Reporte verificado en sitio, se confirma que los postes están apagados']);
        HistorialEstado::create(['reporte_id' => $r2->id, 'usuario_id' => $funcionario->id, 'estado' => 'en_proceso', 'comentario' => 'Cuadrilla eléctrica asignada, trabajando en la reparación']);
        Comentario::create(['reporte_id' => $r2->id, 'usuario_id' => $funcionario->id, 'comentario' => 'Se identificó que el transformador está dañado. Se solicitó repuesto, llega mañana.']);
        Comentario::create(['reporte_id' => $r2->id, 'usuario_id' => $ciudadano->id, 'comentario' => 'Gracias por la rápida respuesta, esperamos que quede solucionado pronto.']);

        // --- 3 ---
        $r3 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => null,
            'categoria_id' => 2,
            'titulo' => 'Basura acumulada en Los Esteros',
            'descripcion' => 'En la esquina del mercado de Los Esteros hay basura acumulada desde hace más de una semana. El olor es insoportable y hay presencia de roedores. Urgente para la salud pública.',
            'latitud' => '-0.9580',
            'longitud' => '-80.7275',
            'direccion' => 'Mercado Los Esteros, Manta',
            'prioridad' => 3,
            'estado' => 'pendiente',
        ]);
        HistorialEstado::create(['reporte_id' => $r3->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);

        // --- 4 ---
        $r4 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => $funcionario->id,
            'categoria_id' => 4,
            'titulo' => 'Fuga de agua potable en El Palmar',
            'descripcion' => 'Una tubería matriz rota está desperdiciando agua potable en la Av. 4 de Noviembre. El agua corre por toda la calle hace 3 días. Se está inundando la zona baja.',
            'latitud' => '-0.9432',
            'longitud' => '-80.7428',
            'direccion' => 'Av. 4 de Noviembre y Calle 8, El Palmar, Manta',
            'prioridad' => 4,
            'estado' => 'en_revision',
        ]);
        HistorialEstado::create(['reporte_id' => $r4->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);
        HistorialEstado::create(['reporte_id' => $r4->id, 'usuario_id' => $funcionario->id, 'estado' => 'en_revision', 'comentario' => 'Visitando el sitio para evaluar daños']);
        Comentario::create(['reporte_id' => $r4->id, 'usuario_id' => $funcionario->id, 'comentario' => 'Se necesita cerrar la válvula principal para reparar. Se coordinará corte de agua programado para mañana.']);

        // --- 5 ---
        $r5 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => null,
            'categoria_id' => 6,
            'titulo' => 'Semáforo dañado en Barbasquillo',
            'descripcion' => 'El semáforo de la Av. 24 y Calle 20 no funciona desde el martes. Han ocurrido dos accidentes leves esta semana. Tráfico caótico en horas pico. Urge reparación.',
            'latitud' => '-0.9210',
            'longitud' => '-80.7205',
            'direccion' => 'Av. 24 y Calle 20, Barbasquillo, Manta',
            'prioridad' => 5,
            'estado' => 'pendiente',
        ]);
        HistorialEstado::create(['reporte_id' => $r5->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);

        // --- 6 ---
        $r6 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => $funcionario->id,
            'categoria_id' => 5,
            'titulo' => 'Alcantarilla colapsada cerca ULEAM',
            'descripcion' => 'La alcantarilla frente a la universidad está completamente colapsada, agua estancada con mal olor y mosquitos. Riesgo sanitario para cientos de estudiantes que pasan a diario.',
            'latitud' => '-0.9412',
            'longitud' => '-80.7520',
            'direccion' => 'Av. Circunvalación, Ciudadela Universitaria, Manta',
            'prioridad' => 3,
            'estado' => 'en_proceso',
        ]);
        HistorialEstado::create(['reporte_id' => $r6->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);
        HistorialEstado::create(['reporte_id' => $r6->id, 'usuario_id' => $funcionario->id, 'estado' => 'en_proceso', 'comentario' => 'Equipo de alcantarillado trabajando en la zona']);
        Comentario::create(['reporte_id' => $r6->id, 'usuario_id' => $funcionario->id, 'comentario' => 'Se encontró obstrucción por escombros. Se está retirando el material.']);
        Comentario::create(['reporte_id' => $r6->id, 'usuario_id' => $ciudadano->id, 'comentario' => 'El olor ha mejorado, pero sigue el agua estancada. Ojalá terminen pronto.']);

        // --- 7 ---
        $r7 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => null,
            'categoria_id' => 7,
            'titulo' => 'Árbol caído bloquea vereda en La Poza',
            'descripcion' => 'Un árbol grande de ficus cayó después de la tormenta del sábado y bloquea completamente la vereda y parte de la calle. Peatones y niños deben caminar por la vía, muy peligroso.',
            'latitud' => '-0.9670',
            'longitud' => '-80.7340',
            'direccion' => 'Calle 5, barrio La Poza, Manta',
            'prioridad' => 4,
            'estado' => 'resuelto',
        ]);
        HistorialEstado::create(['reporte_id' => $r7->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);
        HistorialEstado::create(['reporte_id' => $r7->id, 'usuario_id' => $funcionario->id, 'estado' => 'en_proceso', 'comentario' => 'Brigada de parques acudió al sitio']);
        HistorialEstado::create(['reporte_id' => $r7->id, 'usuario_id' => $funcionario->id, 'estado' => 'resuelto', 'comentario' => 'Árbol retirado y vereda despejada. Se plantará uno nuevo la próxima semana.']);
        Comentario::create(['reporte_id' => $r7->id, 'usuario_id' => $ciudadano->id, 'comentario' => 'Muchas gracias, quedó excelente el trabajo. Ya podemos caminar seguros.']);

        // --- 8 ---
        $r8 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => null,
            'categoria_id' => 8,
            'titulo' => 'Juegos infantiles rotos en parque central',
            'descripcion' => 'Los columpios están rotos con filos cortantes y el tobogán tiene una grieta peligrosa. Varios niños se han lastimado. El parque central es muy concurrido los fines de semana.',
            'latitud' => '-0.9503',
            'longitud' => '-80.7305',
            'direccion' => 'Parque Central de Manta, entre calle 13 y Av. 3',
            'prioridad' => 3,
            'estado' => 'pendiente',
        ]);
        HistorialEstado::create(['reporte_id' => $r8->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);

        // --- 9 ---
        $r9 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => null,
            'categoria_id' => 9,
            'titulo' => 'Inundación recurrente en San Mateo',
            'descripcion' => 'Cada vez que llueve fuerte se inunda la calle principal de San Mateo. Las alcantarillas no dan abasto y el agua sucia entra a las casas. Se necesitan obras de drenaje.',
            'latitud' => '-0.9380',
            'longitud' => '-80.7100',
            'direccion' => 'Calle principal, sector San Mateo, Manta',
            'prioridad' => 5,
            'estado' => 'pendiente',
        ]);
        HistorialEstado::create(['reporte_id' => $r9->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);
        Comentario::create(['reporte_id' => $r9->id, 'usuario_id' => $ciudadano->id, 'comentario' => 'Hoy llovió otra vez y el agua me llegó hasta la puerta. Por favor atiendan esto, es la quinta vez este mes.']);

        // --- 10 ---
        $r10 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => $funcionario->id,
            'categoria_id' => 10,
            'titulo' => 'Grafiti vandálico en monumento al Pescador',
            'descripcion' => 'El monumento emblemático del Pescador en el malecón fue vandalizado con grafiti ofensivo durante la madrugada. Es un símbolo de la ciudad y atrae turistas.',
            'latitud' => '-0.9500',
            'longitud' => '-80.7312',
            'direccion' => 'Monumento al Pescador, Malecón de Manta',
            'prioridad' => 2,
            'estado' => 'en_revision',
        ]);
        HistorialEstado::create(['reporte_id' => $r10->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);
        HistorialEstado::create(['reporte_id' => $r10->id, 'usuario_id' => $funcionario->id, 'estado' => 'en_revision', 'comentario' => 'Evaluando daños para coordinar limpieza con materiales adecuados']);
        Comentario::create(['reporte_id' => $r10->id, 'usuario_id' => $funcionario->id, 'comentario' => 'Se coordinará con la dirección de turismo para la restauración. El grafiti parece ser con pintura en aerosol.']);

        // --- 11 ---
        $r11 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => null,
            'categoria_id' => 1,
            'titulo' => 'Calle agrietada en San Juan',
            'descripcion' => 'Toda la calle 8 de San Juan está agrietada de lado a lado. Parece que el terreno está cediendo por filtraciones de agua. Varias casas muestran grietas en sus paredes también.',
            'latitud' => '-0.9595',
            'longitud' => '-80.7425',
            'direccion' => 'Calle 8, barrio San Juan, Manta',
            'prioridad' => 4,
            'estado' => 'pendiente',
        ]);
        HistorialEstado::create(['reporte_id' => $r11->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);

        // --- 12 ---
        $r12 = Reporte::create([
            'usuario_id' => $ciudadano->id,
            'funcionario_id' => $funcionario->id,
            'categoria_id' => 3,
            'titulo' => 'Cableado eléctrico suelto en avenida',
            'descripcion' => 'Hay cables de alta tensión colgando peligrosamente a baja altura sobre la Av. 2. Representa riesgo de electrocución para peatones y vehículos de carga. Ya rozó un bus.',
            'latitud' => '-0.9318',
            'longitud' => '-80.7375',
            'direccion' => 'Av. 2 entre calles 15 y 16, Manta',
            'prioridad' => 5,
            'estado' => 'en_proceso',
        ]);
        HistorialEstado::create(['reporte_id' => $r12->id, 'usuario_id' => $ciudadano->id, 'estado' => 'pendiente', 'comentario' => 'Reporte creado']);
        HistorialEstado::create(['reporte_id' => $r12->id, 'usuario_id' => $funcionario->id, 'estado' => 'en_proceso', 'comentario' => 'Se acordonó la zona. Equipo eléctrico trabajando.']);
        Comentario::create(['reporte_id' => $r12->id, 'usuario_id' => $funcionario->id, 'comentario' => 'CORTE PROGRAMADO: Se cortará la energía en el sector de 10:00 a 14:00 para reparar los cables.']);
    }
}
