const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, PageBreak, BorderStyle, WidthType,
  ShadingType, TabStopPosition, TabStopType,
} = require('docx');
const fs = require('fs');
const path = require('path');

const C = { primary: '1E40AF', secondary: '3B82F6', dark: '0F172A', gray: '64748B', light: 'F1F5F9' };
const BG = { header: '1E293B', cell: 'F8FAFC' };

function h(text, level, opts = {}) {
  const map = { 0: HeadingLevel.HEADING_1, 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
  return new Paragraph({ heading: map[level] || HeadingLevel.HEADING_1, spacing: { before: level <= 1 ? 400 : 240, after: 120 }, ...opts, children: [new TextRun({ text, bold: true, size: level <= 1 ? 32 : level === 2 ? 26 : 22, color: C.primary, ...opts.run })] });
}

function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 100 }, ...opts, children: [new TextRun({ text, size: 20, color: C.dark, ...opts.run })] });
}

function pBold(text) {
  return p(text, { run: { bold: true } });
}

function bullet(text) {
  return new Paragraph({ spacing: { after: 60 }, bullet: { level: 0 }, children: [new TextRun({ text, size: 20, color: C.dark })] });
}

function code(text) {
  return new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text, size: 17, color: C.dark, font: 'Consolas' })] });
}

function table(headers, rows) {
  const hRow = new TableRow({ tableHeader: true, children: headers.map(h => new TableCell({
    shading: { fill: C.secondary, type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 18 })] })],
  }))});
  const dataRows = rows.map((r, i) => new TableRow({ children: r.map(c => new TableCell({
    shading: i % 2 === 0 ? { fill: BG.cell, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(c), size: 18, color: C.dark })] })],
  }))}));
  return new Table({ rows: [hRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } });
}

function spacer(h = 200) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

const DOC = [
  // =================== PORTADA ===================
  new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'APLICACIONES MÓVILES HÍBRIDAS', bold: true, size: 32, color: C.primary })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 }, children: [new TextRun({ text: 'Unidad 3 | Tema 3.2', size: 24, color: C.gray })] }),
  spacer(200),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Guía docente y práctica de instalación', size: 26, color: C.dark })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Laravel + PostgreSQL + React Native / Expo', size: 22, color: C.gray })] }),
  spacer(400),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Proyecto: Sistema de Reporte Ciudadano', size: 24, color: C.secondary, bold: true })] }),
  spacer(200),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Materia: Aplicaciones Móviles Híbridas', size: 22, color: C.dark })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: 'Docente: [Nombre del docente]', size: 22, color: C.dark })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: 'Alumno: [Nombre del alumno]', size: 22, color: C.dark })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: 'Fecha: Julio 2026', size: 20, color: C.gray })] }),
  new Paragraph({ children: [new TextRun({ text: '' })] }),
  new Paragraph({ children: [new TextRun({ text: '' })] }),

  // =================== 6. GUÍA TÉCNICA DE INSTALACIÓN ===================
  h('6. Guía técnica de instalación: Composer, Laravel y PostgreSQL', 1),

  h('6.1 Requisitos previos', 2),
  p('La siguiente tabla muestra las herramientas necesarias para el desarrollo del proyecto y cómo verificar su correcta instalación:'),
  spacer(60),
  table(['Herramienta', 'Uso en la práctica', 'Verificación'], [
    ['PHP', 'Ejecutar Laravel y Artisan.', 'php -v'],
    ['Composer', 'Instalar dependencias PHP y crear proyectos Laravel.', 'composer -V'],
    ['Laravel Installer', 'Crear proyectos Laravel rápidamente.', 'laravel --version'],
    ['PostgreSQL', 'Base de datos relacional del backend.', 'psql --version'],
    ['Node.js y npm', 'Crear y ejecutar la app Expo.', 'node -v / npm -v'],
    ['Expo Go', 'Probar la app en dispositivo móvil.', 'Instalar desde tienda oficial del dispositivo'],
    ['Postman o Insomnia', 'Probar endpoints antes de integrarlos a la app.', 'Abrir la aplicación y crear una petición GET'],
  ]),
  spacer(60),
  p('Comandos de verificación:'),
  code('php -v'),
  code('composer -V'),
  code('laravel --version'),
  code('psql --version'),
  code('node -v'),
  code('npm -v'),

  h('6.2 Instalación de Composer en Windows', 2),
  bullet('Descargar el instalador oficial para Windows desde la página de Composer.'),
  bullet('Ejecutar Composer-Setup.exe como administrador si el equipo tiene restricciones.'),
  bullet('Cuando el instalador pida la ruta de PHP, seleccionar el archivo php.exe. Ejemplo con XAMPP:'),
  code('C:\\xampp\\php\\php.exe'),
  bullet('Permitir que el instalador agregue Composer al PATH del sistema.'),
  bullet('Cerrar y abrir nuevamente PowerShell o CMD.'),
  bullet('Verificar con composer -V.'),
  spacer(60),
  pBold('Si "composer" no se reconoce:'),
  p('Reinicie la terminal. Si continúa el problema, revise Variables de entorno > Path y confirme que exista la ruta donde Composer instaló composer.bat. Luego vuelva a ejecutar composer -V.'),

  h('6.3 Activar extensiones de PHP necesarias para PostgreSQL', 2),
  p('Para que Laravel pueda conectarse con PostgreSQL, PHP debe tener activas las extensiones de PostgreSQL. En XAMPP, abra el archivo php.ini desde el panel de XAMPP o desde C:\\xampp\\php\\php.ini y quite el punto y coma inicial si aparece comentado:'),
  code('extension=pdo_pgsql'),
  code('extension=pgsql'),
  bullet('Guardar el archivo php.ini.'),
  bullet('Cerrar y abrir la terminal nuevamente.'),
  bullet('Si usa Apache/XAMPP para otros proyectos, reiniciar Apache.'),
  bullet('Validar que PHP cargue las extensiones con:'),
  code('php -m | findstr pgsql'),

  h('6.4 Instalación de PostgreSQL en Windows', 2),
  bullet('Descargar el instalador de PostgreSQL para Windows desde el sitio oficial. El instalador incluye el servidor PostgreSQL y pgAdmin.'),
  bullet('Ejecutar el instalador y seleccionar componentes: PostgreSQL Server, pgAdmin y Command Line Tools.'),
  bullet('Definir una contraseña para el usuario postgres. Guardarla porque se usará en el archivo .env de Laravel.'),
  bullet('Mantener el puerto por defecto 5432, salvo que el laboratorio ya lo tenga ocupado.'),
  bullet('Finalizar la instalación y abrir pgAdmin.'),
  bullet('Crear la base de datos:'),
  code('CREATE DATABASE reporte_ciudadano;'),
  spacer(60),
  pBold('Datos sugeridos para la práctica:'),
  table(['Parámetro', 'Valor'], [
    ['Servidor', 'localhost'],
    ['Puerto', '5432'],
    ['Usuario', 'postgres'],
    ['Base de datos', 'reporte_ciudadano'],
    ['Contraseña', 'La definida durante la instalación'],
  ]),

  h('6.5 Instalación de Laravel', 2),
  pBold('Opción A: Instalar el instalador global de Laravel con Composer:'),
  code('composer global require laravel/installer'),
  code('laravel --version'),
  spacer(60),
  pBold('Opción B: Crear el proyecto directamente con Composer:'),
  code('composer create-project laravel/laravel api'),
  spacer(60),
  pBold('Con el instalador global, crear el proyecto así:'),
  code('laravel new api'),
  code('cd api'),
  spacer(60),
  p('Nota sobre versiones: Usar la versión actual recomendada por la documentación oficial de Laravel instalada por Composer.'),

  h('6.6 Configurar Laravel con PostgreSQL', 2),
  p('En la raíz del proyecto Laravel, abrir el archivo .env y configurar la conexión:'),
  code('DB_CONNECTION=pgsql'),
  code('DB_HOST=127.0.0.1'),
  code('DB_PORT=5432'),
  code('DB_DATABASE=reporte_ciudadano'),
  code('DB_USERNAME=postgres'),
  code('DB_PASSWORD=TU_CONTRASEÑA'),
  spacer(60),
  bullet('Guardar el archivo .env.'),
  bullet('Ejecutar php artisan config:clear para limpiar la configuración cacheada.'),
  bullet('Probar la conexión con las migraciones.'),
  code('php artisan config:clear'),
  code('php artisan migrate'),

  // =================== 7. PRÁCTICA GUIADA: API EN LARAVEL ===================
  h('7. Práctica guiada: creación de API propia en Laravel', 1),
  p('Caso práctico: Se desarrollará una API REST para un Sistema de Reporte Ciudadano. La app móvil podrá listar reportes, crear nuevos reportes, gestionar estados y notificaciones desde el dispositivo móvil.'),

  h('7.1 Crear proyecto y levantar servidor', 2),
  p('Si se usó el instalador global:'),
  code('laravel new api'),
  code('cd api'),
  code('php artisan serve --host=0.0.0.0 --port=8000'),
  spacer(60),
  p('Si se creó con Composer:'),
  code('composer create-project laravel/laravel api'),
  code('cd api'),
  code('php artisan serve --host=0.0.0.0 --port=8000'),

  h('7.2 Habilitar rutas API y crear recursos', 2),
  p('En versiones recientes de Laravel, habilitar la estructura API con:'),
  code('php artisan install:api'),
  spacer(60),
  p('Luego crear los modelos, migraciones y controladores API del sistema:'),
  code('php artisan make:model Reporte -m'),
  code('php artisan make:model Categoria -m'),
  code('php artisan make:model Comentario -m'),
  code('php artisan make:model Notificacion -m'),
  code('php artisan make:controller Api/ReporteController --api'),
  code('php artisan make:controller Api/CategoriaController --api'),
  code('php artisan make:controller Api/ComentarioController --api'),
  code('php artisan make:controller Api/NotificacionController --api'),
  code('php artisan make:controller Api/AuthController'),
  code('php artisan make:controller Api/EstadisticaController'),

  h('7.3 Migraciones', 2),
  p('El sistema cuenta con 5 tablas principales. A continuación se muestra la migración de la tabla reportes como ejemplo principal:'),

  pBold('Migración de reportes'),
  p('Editar el archivo database/migrations/xxxx_create_reportes_table.php:'),
  code("Schema::create('reportes', function (Blueprint \$table) {"),
  code("    \$table->id();"),
  code("    \$table->foreignId('usuario_id')->constrained()->onDelete('cascade');"),
  code("    \$table->foreignId('categoria_id')->constrained()->onDelete('cascade');"),
  code("    \$table->string('titulo');"),
  code("    \$table->text('descripcion');"),
  code("    \$table->string('fotografia')->nullable();"),
  code("    \$table->decimal('latitud', 10, 7);"),
  code("    \$table->decimal('longitud', 10, 7);"),
  code("    \$table->string('direccion', 500)->nullable();"),
  code("    \$table->integer('prioridad');"),
  code("    \$table->enum('estado', ['pendiente','en_revision','en_proceso','resuelto','rechazado'])->default('pendiente');"),
  code("    \$table->timestamp('fecha_reporte')->useCurrent();"),
  code("    \$table->timestamps();"),
  code("});"),
  spacer(60),
  p('Tablas adicionales del sistema:'),
  table(['Tabla', 'Propósito', 'Columnas clave'], [
    ['usuarios', 'Usuarios del sistema', 'name, email, password, telefono, rol'],
    ['categorias', 'Categorías de reportes', 'nombre, icono, color'],
    ['reportes', 'Reportes ciudadanos', 'usuario_id, categoria_id, titulo, estado, prioridad, latitud, longitud'],
    ['comentarios', 'Comentarios en reportes', 'reporte_id, usuario_id, comentario'],
    ['notificaciones', 'Notificaciones de cambios', 'usuario_id, reporte_id, mensaje, leida'],
  ]),
  spacer(60),
  code('php artisan migrate'),

  h('7.4 Modelos', 2),
  p('El sistema utiliza 5 modelos Eloquent con sus relaciones:'),

  pBold('Modelo Reporte (app/Models/Reporte.php):'),
  code('class Reporte extends Model'),
  code('{'),
  code("    protected \$fillable = ['usuario_id', 'categoria_id', 'titulo', 'descripcion', 'fotografia', 'latitud', 'longitud', 'direccion', 'prioridad', 'estado'];"),
  code(''),
  code('    public function usuario() { return \$this->belongsTo(User::class); }'),
  code("    public function categoria() { return \$this->belongsTo(Categoria::class); }"),
  code("    public function comentarios() { return \$this->hasMany(Comentario::class); }"),
  code("    public function notificaciones() { return \$this->hasMany(Notificacion::class); }"),
  code('}'),

  spacer(60),
  p('Los demás modelos siguen el mismo patrón. Las relaciones completas son:'),
  bullet('Usuario → hasMany → Reporte, Comentario, Notificacion'),
  bullet('Reporte → belongsTo → Usuario, Categoria | hasMany → Comentario, Notificacion'),
  bullet('Categoria → hasMany → Reporte'),
  bullet('Comentario → belongsTo → Reporte, Usuario'),
  bullet('Notificacion → belongsTo → Usuario, Reporte'),

  h('7.5 Controladores API', 2),
  p('El sistema cuenta con 6 controladores API. A continuación se muestra el controlador principal de reportes:'),

  pBold('Controlador Reporte (app/Http/Controllers/Api/ReporteController.php):'),
  code('class ReporteController extends Controller'),
  code('{'),
  code('    public function index(Request \$request)'),
  code('    {'),
  code("        \$query = Reporte::with(['usuario', 'categoria']);"),
  code("        if (\$request->filled('categoria_id')) {"),
  code("            \$query->where('categoria_id', \$request->categoria_id);"),
  code('        }'),
  code("        if (\$request->filled('estado')) {"),
  code("            \$query->where('estado', \$request->estado);"),
  code('        }'),
  code("        return ReporteResource::collection("),
  code("            \$query->orderBy('id', 'desc')->paginate(20)"),
  code('        );'),
  code('    }'),
  code(''),
  code('    public function store(StoreReporteRequest \$request)'),
  code('    {'),
  code("        \$data = \$request->validated();"),
  code("        \$data['usuario_id'] = auth()->id();"),
  code("        if (\$request->hasFile('fotografia')) {"),
  code("            \$data['fotografia'] = \$request->file('fotografia')->store('reportes', 'public');"),
  code('        }'),
  code("        \$reporte = Reporte::create(\$data);"),
  code("        return ReporteResource::make(\$reporte->load(['usuario', 'categoria']))->response()->setStatusCode(201);"),
  code('    }'),
  code(''),
  code("    public function updateEstado(UpdateEstadoRequest \$request, Reporte \$reporte)"),
  code('    {'),
  code("        if (!in_array(auth()->user()->rol, ['funcionario', 'admin'])) {"),
  code("            return response()->json(['error' => 'No autorizado'], 403);"),
  code('        }'),
  code("        \$reporte->update(\$request->validated());"),
  code("        Notificacion::create(["),
  code("            'usuario_id' => \$reporte->usuario_id,"),
  code("            'reporte_id' => \$reporte->id,"),
  code("            'mensaje' => \"Tu reporte '{\$reporte->titulo}' cambió a estado: {\$request->estado}\","),
  code('        ]);'),
  code("        return ReporteResource::make(\$reporte->load(['usuario', 'categoria']));"),
  code('    }'),
  code('}'),

  h('7.6 Rutas API', 2),
  p('El sistema expone 20 endpoints RESTful. Editar routes/api.php:'),
  code("Route::post('register', [AuthController::class, 'register']);"),
  code("Route::post('login', [AuthController::class, 'login']);"),
  code("Route::get('reportes', [ReporteController::class, 'index']);"),
  code("Route::get('reportes/{reporte}', [ReporteController::class, 'show']);"),
  code("Route::get('reportes/{reporte}/comentarios', [ComentarioController::class, 'index']);"),
  code("Route::get('categorias', [CategoriaController::class, 'index']);"),
  code(''),
  code("Route::middleware('auth:sanctum')->group(function () {"),
  code("    Route::post('logout', [AuthController::class, 'logout']);"),
  code("    Route::get('user', [AuthController::class, 'user']);"),
  code("    Route::post('reportes', [ReporteController::class, 'store']);"),
  code("    Route::put('reportes/{reporte}', [ReporteController::class, 'update']);"),
  code("    Route::get('mis-reportes', [ReporteController::class, 'misReportes']);"),
  code("    Route::patch('reportes/{reporte}/estado', [ReporteController::class, 'updateEstado']);"),
  code("    Route::post('reportes/{reporte}/comentarios', [ComentarioController::class, 'store']);"),
  code("    Route::get('notificaciones', [NotificacionController::class, 'index']);"),
  code("    Route::patch('notificaciones/{id}/leida', [NotificacionController::class, 'marcarLeida']);"),
  code("    Route::get('estadisticas', [EstadisticaController::class, 'index']);"),
  code("    Route::post('categorias', [CategoriaController::class, 'store']);"),
  code("    Route::put('categorias/{categoria}', [CategoriaController::class, 'update']);"),
  code("    Route::delete('categorias/{categoria}', [CategoriaController::class, 'destroy']);"),
  code("    Route::delete('reportes/{reporte}', [ReporteController::class, 'destroy']);"),
  code('});'),
  spacer(60),
  p('Verificar las rutas generadas:'),
  code('php artisan route:list'),

  h('7.7 Prueba de endpoints en Postman o Insomnia', 2),
  p('A continuación se muestran los endpoints principales para probar la API:'),
  spacer(60),
  table(['Acción', 'Método', 'URL', 'Body JSON'], [
    ['Listar reportes', 'GET', '/api/reportes', 'No aplica'],
    ['Ver reporte', 'GET', '/api/reportes/1', 'No aplica'],
    ['Crear reporte', 'POST', '/api/reportes', '{ "titulo": "Bache", "descripcion": "...", "categoria_id": 1, "latitud": 19.43, "longitud": -99.13, "prioridad": 4 }'],
    ['Actualizar estado', 'PATCH', '/api/reportes/1/estado', '{ "estado": "en_proceso" }'],
    ['Listar categorías', 'GET', '/api/categorias', 'No aplica'],
    ['Login', 'POST', '/api/login', '{ "email": "ciudadano@reportes.com", "password": "ciudadano123" }'],
    ['Comentar', 'POST', '/api/reportes/1/comentarios', '{ "comentario": "Texto del comentario" }'],
  ]),
  spacer(60),
  p('Encabezados recomendados para POST/PUT/PATCH:'),
  p('Content-Type: application/json | Accept: application/json', { run: { font: 'Consolas', size: 16 } }),
  p('Para endpoints autenticados, incluir:'),
  p('Authorization: Bearer {token_obtenido_del_login}', { run: { font: 'Consolas', size: 16 } }),

  // =================== 8. PRÁCTICA GUIADA: CONSUMO DESDE EXPO ===================
  h('8. Práctica guiada: consumo desde React Native / Expo', 1),

  h('8.1 Crear proyecto móvil', 2),
  code('npx create-expo-app movil-app'),
  code('cd movil-app'),
  code('npx expo start --clear'),

  h('8.2 Configurar la URL base correctamente', 2),
  bullet('Si prueba desde navegador en la misma PC: http://localhost:8000/api.'),
  bullet('Si prueba desde Android Emulator: http://10.0.2.2:8000/api.'),
  bullet('Si prueba desde un celular físico con Expo Go: usar la IP local de la computadora.'),
  bullet('El celular y la computadora deben estar en la misma red WiFi.'),
  bullet('Laravel debe ejecutarse con --host=0.0.0.0 para aceptar conexiones externas.'),
  bullet('Si Windows Firewall pregunta, permitir acceso a la red privada.'),
  spacer(60),
  code('ipconfig'),
  code('php artisan serve --host=0.0.0.0 --port=8000'),

  h('8.3 Código base de App.js', 2),
  p('El proyecto utiliza una arquitectura de 5 tabs. A continuación se muestra la estructura principal de App.js:'),

  pBold('App.js (estructura principal):'),
  code("const Tab = createBottomTabNavigator();"),
  code("const Stack = createNativeStackNavigator();"),
  code(''),
  code("function TabNavigator({ token, updateToken }) {"),
  code("  return ("),
  code("    <Tab.Navigator screenOptions={{ headerShown: false,"),
  code("      tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b' },"),
  code("      tabBarActiveTintColor: '#3b82f6', tabBarInactiveTintColor: '#64748b',"),
  code("      tabBarIcon: ({ color, size }) => <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />,"),
  code("    }}>"),
  code("      <Tab.Screen name='Inicio'>{() => <HomeScreen token={token} />}</Tab.Screen>"),
  code("      <Tab.Screen name='Reportes'>{() => <ReportesScreen token={token} />}</Tab.Screen>"),
  code("      <Tab.Screen name='Reportar'>{() => <NuevoReporteScreen token={token} />}</Tab.Screen>"),
  code("      <Tab.Screen name='Notificaciones'>{() => <NotificacionesScreen token={token} />}</Tab.Screen>"),
  code("      <Tab.Screen name='Perfil'>{() => <PerfilScreen token={token} setToken={updateToken} />}</Tab.Screen>"),
  code("    </Tab.Navigator>"),
  code("  );"),
  code("}"),

  spacer(60),
  pBold('Servicio API (src/services/api.js):'),
  code("const API_URL = 'http://192.168.1.15:8000/api';"),
  code(''),
  code("async function request(endpoint, options = {}) {"),
  code("  const token = await leerToken();"),
  code("  const headers = { Accept: 'application/json', ...options.headers };"),
  code("  if (token) headers.Authorization = 'Bearer ' + token;"),
  code("  const controller = new AbortController();"),
  code("  setTimeout(() => controller.abort(), 15000);"),
  code("  const res = await fetch(API_URL + endpoint, { ...options, headers, signal: controller.signal });"),
  code("  const data = await res.json();"),
  code("  if (!res.ok) throw new Error(data.message || 'Error en la solicitud');"),
  code("  return data;"),
  code('}'),

  h('8.4 Explicación didáctica del código móvil', 2),
  table(['Fragmento', 'Explicación'], [
    ['BASE_URL / API_URL', 'Define la dirección de la API. Es el punto más común de error cuando se usa celular físico.'],
    ['useEffect / useFocusEffect', 'Ejecuta la carga inicial de datos al abrir la pantalla o al enfocarse.'],
    ['fetch GET', 'Solicita datos al endpoint y convierte la respuesta JSON en arreglo.'],
    ['fetch POST', 'Envía un nuevo reporte en formato JSON (o FormData con foto) al backend Laravel.'],
    ['respuesta.ok', 'Permite detectar respuestas HTTP no exitosas y mostrar mensajes de error.'],
    ['ActivityIndicator', 'Muestra estado de carga mientras se ejecuta la petición.'],
    ['FlatList', 'Renderiza la lista de reportes obtenida desde PostgreSQL mediante la API.'],
    ['RefreshControl', 'Permite al usuario deslizar hacia abajo para recargar la lista.'],
    ['AbortController', 'Cancela la petición si el servidor no responde en 15 segundos.'],
    ['AsyncStorage', 'Guarda el token de autenticación localmente para sesiones persistentes.'],
  ]),

  // =================== 9. EVALUACIÓN FORMATIVA ===================
  h('9. Evaluación formativa de la clase', 1),
  table(['Criterio', 'Excelente (2)', 'Aceptable (1)', 'Insuficiente (0)'], [
    ['Configuración del entorno', 'Verifica PHP, Composer, Laravel, PostgreSQL y Node correctamente.', 'Verifica la mayoría de herramientas con apoyo.', 'No logra verificar el entorno.'],
    ['API Laravel', 'Crea modelo, migración, controlador y rutas REST funcionales.', 'La API funciona parcialmente.', 'La API no responde o no conecta con la base.'],
    ['Prueba de endpoints', 'Prueba GET y POST con evidencias claras.', 'Prueba solo un endpoint o evidencia incompleta.', 'No presenta pruebas.'],
    ['Consumo desde Expo', 'La app lista y registra reportes desde la API propia.', 'La app solo lista o requiere apoyo para funcionar.', 'La app no consume la API.'],
    ['Resolución de problemas', 'Identifica y documenta el error y la solución aplicada.', 'Describe el error sin explicar claramente la solución.', 'No documenta errores ni soluciones.'],
  ]),
  spacer(60),
  p('Puntaje sugerido: 10 puntos. Puede adaptarse a la escala institucional.'),

  // =================== 10. EVIDENCIAS ===================
  h('10. Evidencia que deben entregar los estudiantes', 1),
  bullet('Captura de composer -V, php -v y psql --version.'),
  bullet('Captura del archivo .env sin mostrar la contraseña completa. Puede ocultarse la contraseña.'),
  bullet('Captura de php artisan migrate ejecutado correctamente.'),
  bullet('Captura de php artisan db:seed ejecutado correctamente.'),
  bullet('Captura de php artisan route:list mostrando las rutas API.'),
  bullet('Captura de Postman/Insomnia con GET /api/reportes.'),
  bullet('Captura de Postman/Insomnia con POST /api/reportes.'),
  bullet('Captura de Postman/Insomnia con PATCH /api/reportes/{id}/estado.'),
  bullet('Captura de Postman/Insomnia con POST /api/login (obteniendo token).'),
  bullet('Captura de la app móvil mostrando la pantalla de inicio con estadísticas.'),
  bullet('Captura de la app móvil mostrando el formulario de nuevo reporte.'),
  bullet('Captura de la app móvil mostrando el perfil del usuario autenticado.'),
  bullet('Breve bitácora de errores encontrados y cómo fueron solucionados.'),

  // =================== 11. ACTIVIDAD AUTÓNOMA ===================
  h('11. Actividad autónoma sugerida', 1),
  pBold('Título: Extensión de una API propia para una aplicación móvil híbrida'),
  p('Indicaciones:'),
  bullet('Agregar a la tabla reportes los campos que consideres necesarios para mejorar el sistema (ej. fecha_solucion, costo_estimado).'),
  bullet('Crear una validación adicional: la prioridad debe estar entre 1 y 5, y el título no debe exceder 255 caracteres.'),
  bullet('Implementar en la app móvil un botón "Actualizar" con RefreshControl en todas las pantallas con listas.'),
  bullet('Investigar brevemente qué es un token Bearer y para qué sirve en una API móvil.'),
  bullet('Presentar un informe de 2 a 3 páginas con capturas, explicación del flujo App → API → Base de datos y conclusiones.'),
  spacer(60),
  p('Producto final: Informe PDF y enlace/capturas del proyecto.'),
  p('Evaluación sugerida: funcionamiento 40%, explicación técnica 30%, evidencias 20%, presentación 10%.'),
  spacer(60),
  p('Usuarios de prueba creados por los seeders:'),
  table(['Rol', 'Email', 'Contraseña'], [
    ['Administrador', 'admin@reportes.com', 'admin123'],
    ['Funcionario', 'funcionario@reportes.com', 'func123'],
    ['Ciudadano', 'ciudadano@reportes.com', 'ciudadano123'],
  ]),

  // =================== 12. ERRORES FRECUENTES ===================
  h('12. Errores frecuentes y solución rápida', 1),
  table(['Error', 'Causa probable', 'Solución'], [
    ['composer no se reconoce', 'Composer no está en PATH o la terminal no se reinició.', 'Reabrir PowerShell/CMD, revisar variable Path y ejecutar composer -V.'],
    ['could not find driver', 'Extensión pdo_pgsql no está activa en PHP.', 'Activar extension=pdo_pgsql y extension=pgsql en php.ini. Reiniciar terminal.'],
    ['password authentication failed', 'Contraseña o usuario de PostgreSQL incorrecto.', 'Revisar DB_USERNAME y DB_PASSWORD en .env. Ejecutar php artisan config:clear.'],
    ['connection refused', 'PostgreSQL no está iniciado o puerto incorrecto.', 'Iniciar servicio PostgreSQL y confirmar puerto 5432.'],
    ['La app dice Network request failed', 'Se usó localhost desde el celular o el firewall bloquea.', 'Usar IP de la PC, ejecutar Laravel con --host=0.0.0.0 y permitir firewall.'],
    ['404 en /api/reportes', 'Ruta API no registrada o servidor equivocado.', 'Revisar routes/api.php y ejecutar php artisan route:list.'],
    ['422 Unprocessable Content', 'Validación Laravel falló.', 'Revisar que el JSON tenga todos los campos requeridos y válidos.'],
    ['500 Internal Server Error', 'Error en código, migración o conexión DB.', 'Revisar terminal de Laravel y logs en storage/logs/laravel.log.'],
    ['Token no funciona / 401', 'Token expirado o mal formado.', 'Volver a iniciar sesión con POST /api/login y usar el nuevo token.'],
    ['Seed duplicado', 'Los datos ya fueron insertados anteriormente.', 'Ejecutar php artisan migrate:fresh --seed para reiniciar la base de datos.'],
  ]),

  // =================== FIN ===================
];

async function main() {
  const doc = new Document({ sections: [{ children: DOC }] });
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, 'docs', 'Sistema_Reporte_Ciudadano_Documentacion.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Documento generado:', outPath);
}

main().catch(console.error);
