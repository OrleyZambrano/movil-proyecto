<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!in_array($request->user()->rol, $roles)) {
            return response()->json(['error' => 'No autorizado para esta acción'], 403);
        }

        return $next($request);
    }
}
