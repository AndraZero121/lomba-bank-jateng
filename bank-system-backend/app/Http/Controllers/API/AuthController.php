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
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    use ApiResourceTyper;
    /**
     * Display a listing of the resource.
     */
    public function login(Request $request)
    {
        $maxAttempts = 5;
        $decayMinutes = 1;
        $key = 'login_attempts:' . $request->ip();
        if (cache()->get($key, 0) >= $maxAttempts) {
            return response()->json([
                'message' => 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
            ], 429);
        }
        try {
            Log::info('Login attempt', ['login' => $request->login, 'ip' => $request->ip()]);
            $request->validate([
                'login' => 'required|max:255',
                'password' => 'required|max:255'
            ]);
            $login_type = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'name';
            $user = User::where($login_type, $request->login)->first();
            if (!$user || !isset($user->password) || !is_string($user->password) || $user->password === '' || !Hash::check($request->password, (string)$user->password)) {
                cache()->put($key, cache()->get($key, 0) + 1, now()->addMinutes($decayMinutes));
                Log::warning('Login failed', ['login' => $request->login, 'ip' => $request->ip()]);
                throw ValidationException::withMessages([
                    'login' => ['Kredensial tidak valid, silakan coba lagi.']
                ]);
            }
            // Selalu generate & kirim OTP setiap login
            $otp = random_int(100000, 999999);
            $user->otp_code = Hash::make($otp);
            $user->otp_expires_at = now()->addMinutes(10);
            $user->is_verified = false;
            $user->save();
            try {
                Mail::raw('Kode OTP Anda: ' . $otp, function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Verifikasi OTP Login Anda');
                });
                $mailStatus = 'OTP berhasil dikirim ke email.';
            } catch (\Exception $e) {
                Log::error('Gagal mengirim email OTP: ' . $e->getMessage());
                $mailStatus = 'OTP gagal dikirim ke email.';
            }
            // Tidak pernah return token di sini, hanya status OTP
            return response()->json([
                'message' => 'OTP login telah dikirim. ' . $mailStatus,
                'need_otp' => true
            ], 200);
        } catch (ValidationException $e) {
            Log::error('Validation failed during login', ['errors' => $e->errors(), 'login' => $request->login]);
            return response()->json([
                'errors' => $e->errors(),
                'message' => 'Validasi gagal'
            ], 422);
        } catch (\Exception $e) {
            Log::error('Server error during login', ['error' => $e->getMessage(), 'login' => $request->login]);
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
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
            $credencials['roles'] = 'Karyawan';
            $credencials['is_verified'] = false;
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
                "message" => "User created successfully. Silakan login untuk menerima OTP.",
                "status" => true
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors(),
                'message' => 'Validasi gagal, nama/email sudah terpakai.'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verifikasi OTP setelah login
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'otp' => 'required|digits:6',
        ]);
        $user = User::where('email', $request->login)->orWhere('name', $request->login)->first();
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }
        if (!$user->otp_code || !$user->otp_expires_at || now()->gt($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP sudah kadaluarsa'], 422);
        }
        if (!Hash::check($request->otp, $user->otp_code)) {
            return response()->json(['message' => 'OTP salah'], 422);
        }
        $user->is_verified = true;
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();
        // Setelah OTP benar, login sukses dan token diberikan
        $token = $user->createToken('token')->plainTextToken;
        return response()->json([
            'message' => 'Login dan verifikasi OTP berhasil',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
        ]);
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
