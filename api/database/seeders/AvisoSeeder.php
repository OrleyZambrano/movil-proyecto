<?php

namespace Database\Seeders;

use App\Models\Aviso;
use App\Models\User;
use Illuminate\Database\Seeder;

class AvisoSeeder extends Seeder
{
    public function run(): void
    {
        $funcionario = User::where('rol', 'funcionario')->first();
        $admin = User::where('rol', 'admin')->first();

        Aviso::create([
            'usuario_id' => $funcionario->id,
            'titulo' => 'Corte de luz programado zona centro',
            'descripcion' => 'La empresa eléctrica CNEL realizará mantenimiento de redes de media tensión este viernes 18 de julio de 8:00 a 16:00. Zonas afectadas: calles 10 a 15 y avenidas 1 a 4 del centro de Manta. Se recomienda tomar precauciones con equipos electrónicos.',
            'tipo' => 'corte_luz',
            'prioridad' => 2,
            'latitud' => '-0.9500',
            'longitud' => '-80.7305',
            'direccion' => 'Centro de Manta, entre calles 10-15 y Av. 1-4',
            'fecha_inicio' => '2026-07-18 08:00:00',
            'fecha_fin' => '2026-07-18 16:00:00',
            'activo' => true,
        ]);

        Aviso::create([
            'usuario_id' => $admin->id,
            'titulo' => 'Emergencia: derrame químico en el puerto',
            'descripcion' => 'Se ha reportado un derrame de sustancias químicas en el sector del puerto pesquero. Se solicita EVACUAR la zona inmediatamente. Equipos de bomberos y gestión de riesgos en camino. No acercarse al área del muelle 3.',
            'tipo' => 'emergencia',
            'prioridad' => 5,
            'latitud' => '-0.9480',
            'longitud' => '-80.7290',
            'direccion' => 'Puerto Pesquero de Manta, muelle 3, zona de carga',
            'fecha_inicio' => '2026-07-12 14:30:00',
            'fecha_fin' => null,
            'activo' => true,
        ]);

        Aviso::create([
            'usuario_id' => $funcionario->id,
            'titulo' => 'Jornada de vacunación gratuita en el coliseo',
            'descripcion' => 'Este sábado 19 de julio se realizará una jornada masiva de vacunación gratuita para niños, adultos mayores y embarazadas en el coliseo municipal. De 8:00 a 14:00. Se aplicarán vacunas contra influenza, tétanos, hepatitis B y refuerzos COVID. Traer cédula de identidad y carnet de vacunación si lo tiene.',
            'tipo' => 'evento',
            'prioridad' => 3,
            'latitud' => '-0.9490',
            'longitud' => '-80.7320',
            'direccion' => 'Coliseo Municipal, Av. 3 y Calle 14, Manta',
            'fecha_inicio' => '2026-07-19 08:00:00',
            'fecha_fin' => '2026-07-19 14:00:00',
            'activo' => true,
        ]);

        Aviso::create([
            'usuario_id' => $admin->id,
            'titulo' => 'Corte de agua en Tarqui por reparación',
            'descripcion' => 'Se suspenderá el servicio de agua potable en el barrio Tarqui este miércoles 16 de julio de 6:00 a 18:00 por reparación de tubería matriz. Se recomienda almacenar suficiente agua para el día. Se enviarán tanqueros a puntos estratégicos.',
            'tipo' => 'corte_agua',
            'prioridad' => 3,
            'latitud' => '-0.9338',
            'longitud' => '-80.7370',
            'direccion' => 'Barrio Tarqui, sector tubería matriz, Manta',
            'fecha_inicio' => '2026-07-16 06:00:00',
            'fecha_fin' => '2026-07-16 18:00:00',
            'activo' => true,
        ]);

        Aviso::create([
            'usuario_id' => $funcionario->id,
            'titulo' => 'Albergue temporal por lluvias intensas',
            'descripcion' => 'Se habilita albergue temporal en la escuela fiscal de Los Esteros para familias afectadas por las fuertes lluvias de los últimos días. Se ofrece colchonetas, alimentos calientes, agua potable y atención médica básica. Si conoces a alguien que necesite ayuda, por favor difunde esta información.',
            'tipo' => 'ayuda',
            'prioridad' => 4,
            'latitud' => '-0.9585',
            'longitud' => '-80.7265',
            'direccion' => 'Escuela Fiscal Los Esteros, Calle 3, Manta',
            'fecha_inicio' => '2026-07-11 20:00:00',
            'fecha_fin' => '2026-07-15 20:00:00',
            'activo' => true,
        ]);

        Aviso::create([
            'usuario_id' => $admin->id,
            'titulo' => 'Feria ciudadana de servicios en el malecón',
            'descripcion' => 'Este domingo 20 de julio se realizará la Feria Ciudadana en el malecón de Manta. Habrá stands de servicios municipales, asesoría legal gratuita, feria de emprendedores locales, shows culturales, juegos infantiles y mucho más. De 9:00 a 18:00. Entrada libre.',
            'tipo' => 'evento',
            'prioridad' => 1,
            'latitud' => '-0.9505',
            'longitud' => '-80.7310',
            'direccion' => 'Malecón de Manta, Plaza Cívica',
            'fecha_inicio' => '2026-07-20 09:00:00',
            'fecha_fin' => '2026-07-20 18:00:00',
            'activo' => true,
        ]);
    }
}
