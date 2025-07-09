<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use AndraZero121\ApiResourceTyper\Traits\ApiResourceTyper;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    use ApiResourceTyper;
    /**
     * Display a listing of the resource.
     */
    public function login(Request $request)
    {
        try {
            Log::info('Login attempt', ['login' => $request->login, 'ip' => $request->ip()]);

            $request->validate([
                'login' => 'required|max:255', // bisa email atau name
                'password' => 'required|max:255'
            ]);

            // Deteksi apakah input login berupa email atau name
            $login_type = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'name';
            
            $user = User::where($login_type, $request->login)->first();
            
            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::warning('Login failed', ['login' => $request->login, 'ip' => $request->ip()]);
                throw ValidationException::withMessages([
                    'login' => ['Kredensial tidak valid, silakan coba lagi.'],
                ]);
            }

            $token = $user->createToken('token')->plainTextToken;

            Log::info('Login successful', ['user_id' => $user->id, 'login' => $request->login, 'ip' => $request->ip()]);

            return response()->json([
                "token" => $token,
                "token_type" => "Bearer",
                "user" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "roles" => $user->roles,
                    "created_at" => $user->created_at,
                    "updated_at" => $user->updated_at,
                ],
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation failed during login', ['errors' => $e->errors(), 'login' => $request->login]);
            return response()->json([
                'errors' => $e->errors(),
                'message' => 'Validasi gagal',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Server error during login', ['error' => $e->getMessage(), 'login' => $request->login]);
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function register(Request $request)
    {
        try {
            $credencials = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $credencials['password'] = Hash::make($credencials['password']);
            $credencials['roles'] = 'Karyawan'; // Set role default
            // Log::info ini dipindahkan ke sini, setelah 'roles' diatur
            Log::info('Role yang akan disimpan: ' . $credencials['roles']); 

            $user = User::create($credencials);

            return response()->json([
                "user" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "roles" => $user->roles,
                    "created_at" => $user->created_at,
                    "updated_at" => $user->updated_at,
                ],
                "message" => "User created successfully",
                "status" => true,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors(),
                'message' => 'Validasi gagal, nama/email sudah terpakai.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        return response()->json([
            "message" => "User logged out successfully",
            "status" => true,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
