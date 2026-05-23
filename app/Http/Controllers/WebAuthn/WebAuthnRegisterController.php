<?php

namespace App\Http\Controllers\WebAuthn;

use App\Http\Controllers\Controller;
use Laragear\WebAuthn\Http\Requests\AttestationRequest;
use Laragear\WebAuthn\Http\Requests\AttestedRequest;

class WebAuthnRegisterController extends Controller
{
    public function options(AttestationRequest $request)
    {
        return $request->toCreate();
    }

    public function register(AttestedRequest $request)
    {
        try {
            $credential = $request->save();
            return response()->json([
                'message' => 'Fingerprint registered successfully!',
                'id' => $credential->id ?? null,
            ]);
        } catch (\Exception $e) {
            \Log::error('WebAuthn register error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}