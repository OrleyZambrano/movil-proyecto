<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UsuarioController extends Controller
{
    private function soloAdmin(): ?JsonResponse
    {
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        return null;
    }

    public function index(Request $request): JsonResponse
    {
        if ($resp = $this->soloAdmin()) return $resp;

        $query = User::query();
        if ($request->filled('rol')) {
            $query->where('rol', $request->rol);
        }

        $usuarios = $query->orderBy('id')
            ->get(['id', 'name', 'email', 'telefono', 'rol', 'created_at']);

        return response()->json($usuarios);
    }

    public function funcionarios(Request $request): JsonResponse
    {
        if ($resp = $this->soloAdmin()) return $resp;

        $usuarios = User::where('rol', 'funcionario')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json($usuarios);
    }

    public function store(Request $request): JsonResponse
    {
        if ($resp = $this->soloAdmin()) return $resp;

        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'unique:users'],
            'password'  => ['required', 'min:6'],
            'telefono'  => ['nullable', 'string', 'max:20'],
            'rol'       => ['required', Rule::in(['ciudadano', 'funcionario', 'admin'])],
        ]);

        $data['password'] = Hash::make($data['password']);
        $usuario = User::create($data);

        return response()->json($usuario, 201);
    }

    public function update(Request $request, User $usuario): JsonResponse
    {
        if ($resp = $this->soloAdmin()) return $resp;

        $data = $request->validate([
            'name'      => ['sometimes', 'string', 'max:255'],
            'email'     => ['sometimes', 'email', 'unique:users,email,' . $usuario->id],
            'password'  => ['sometimes', 'min:6'],
            'telefono'  => ['nullable', 'string', 'max:20'],
            'rol'       => ['sometimes', Rule::in(['ciudadano', 'funcionario', 'admin'])],
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $usuario->update($data);

        return response()->json($usuario);
    }

    public function destroy(User $usuario): JsonResponse
    {
        if ($resp = $this->soloAdmin()) return $resp;

        if ($usuario->id === auth()->id()) {
            throw ValidationException::withMessages([
                'id' => ['No puedes eliminarte a ti mismo.'],
            ]);
        }

        $usuario->delete();

        return response()->json(['mensaje' => 'Usuario eliminado']);
    }
}
