<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoriaResource;
use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoriaController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoriaResource::collection(Categoria::all());
    }

    public function store(Request $request): JsonResponse
    {
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:categorias'],
            'icono'  => ['required', 'string', 'max:50'],
            'color'  => ['required', 'string', 'max:7'],
        ]);

        $categoria = Categoria::create($data);

        return response()->json(CategoriaResource::make($categoria), 201);
    }

    public function update(Request $request, Categoria $categoria): JsonResponse
    {
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:categorias,nombre,' . $categoria->id],
            'icono'  => ['required', 'string', 'max:50'],
            'color'  => ['required', 'string', 'max:7'],
        ]);

        $categoria->update($data);

        return response()->json(CategoriaResource::make($categoria));
    }

    public function destroy(Categoria $categoria): JsonResponse
    {
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $categoria->delete();

        return response()->json(['mensaje' => 'Categoría eliminada']);
    }
}
