<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Karyawan;
use App\Models\Jabatan;
use App\Models\Departemen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use AndraZero121\ApiResourceTyper\Traits\ApiResourceTyper;

class KaryawanController extends Controller
{
    use ApiResourceTyper;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $karyawans = Karyawan::with(['jabatan', 'departemen'])->get();
        return response()->json([
            'status' => true,
            'message' => 'Data Karyawan Berhasil Diambil',
            'data' => $karyawans,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email|max:255|unique:users,email|unique:karyawans,email',
            'id_jabatan' => 'required|exists:jabatans,id',
            'id_departemen' => 'required|exists:departemens,id',
            'nama_lengkap' => 'required|string|max:255',
            'nik_ktp' => 'nullable|string|max:16|unique:karyawans,nik_ktp',
            'npwp' => 'nullable|string|max:20|unique:karyawans,npwp',
            'status_ptkp' => 'nullable|string|max:10',
            'tanggal_bergabung' => 'nullable|date',
            'gaji_pokok' => 'nullable|numeric',
            'nomor_rekening' => 'nullable|string|max:50',
            'nama_bank' => 'nullable|string|max:100',
            'status_kepegawaian' => 'nullable|in:Tetap,Kontrak,Harian',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            // 1. Buat Karyawan
            $karyawan = Karyawan::create($validatedData);

            // 2. Buat User baru untuk karyawan
            $password = Str::random(8); // password acak
            $user = User::create([
                'name'      => $karyawan->nama_lengkap, // Menggunakan nama_lengkap dari karyawan
                'email'     => $karyawan->email,
                'password'  => Hash::make($password),
                'roles'     => 'Karyawan',
                'is_verified' => false, // Default is_verified ke false sampai login pertama & OTP
                'id_karyawan' => $karyawan->id, // ✨ [FIX] Menautkan user dengan karyawan
            ]);

            // Kirim password ke email karyawan
            try {
                Mail::raw('Akun Anda telah dibuat. Email: ' . $user->email . ' Password: ' . $password, function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Akun Karyawan Baru Anda');
                });
            } catch (\Exception $e) {
                Log::error('Gagal mengirim email pembuatan akun: ' . $e->getMessage());
                // Tidak menggagalkan transaksi jika hanya email yang gagal, tapi dicatat
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Karyawan dan user telah berhasil dibuat',
                'data' => $karyawan,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal membuat karyawan dan user: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan pada server saat membuat data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $karyawan = Karyawan::with(['jabatan', 'departemen'])->find($id);
        if (!$karyawan) {
            return response()->json([
                'status' => false,
                'message' => 'Karyawan tidak ditemukan',
            ], 404);
        }
        return response()->json([
            'status' => true,
            'message' => 'Detail Karyawan',
            'data' => $karyawan,
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $karyawan = Karyawan::find($id);
        if (!$karyawan) {
            return response()->json([
                'status' => false,
                'message' => 'Karyawan tidak ditemukan',
            ], 404);
        }

        $validatedData = $request->validate([
            // Email harus unik kecuali untuk user saat ini
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $karyawan->user->id . '|unique:karyawans,email,' . $id,
            'id_jabatan' => 'sometimes|required|exists:jabatans,id',
            'id_departemen' => 'sometimes|required|exists:departemens,id',
            'nama_lengkap' => 'sometimes|required|string|max:255',
            'nik_ktp' => 'nullable|string|max:16|unique:karyawans,nik_ktp,' . $id,
            'npwp' => 'nullable|string|max:20|unique:karyawans,npwp,' . $id,
            'status_ptkp' => 'nullable|string|max:10',
            'tanggal_bergabung' => 'nullable|date',
            'gaji_pokok' => 'nullable|numeric',
            'nomor_rekening' => 'nullable|string|max:50',
            'nama_bank' => 'nullable|string|max:100',
            'status_kepegawaian' => 'nullable|in:Tetap,Kontrak,Harian',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            // Update Karyawan
            $karyawan->update($validatedData);

            // ✨ [FIX] Update data user terkait jika ada perubahan
            if ($karyawan->user) {
                $userDataToUpdate = [];
                if (isset($validatedData['nama_lengkap'])) {
                    $userDataToUpdate['name'] = $validatedData['nama_lengkap'];
                }
                if (isset($validatedData['email'])) {
                    $userDataToUpdate['email'] = $validatedData['email'];
                }
                if (!empty($userDataToUpdate)) {
                    $karyawan->user->update($userDataToUpdate);
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Karyawan telah berhasil diperbarui',
                'data' => $karyawan,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal update karyawan: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan pada server saat memperbarui data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $karyawan = Karyawan::find($id);
            if (!$karyawan) {
                return response()->json([
                    'status' => false,
                    'message' => 'Karyawan tidak ditemukan',
                ], 404);
            }

            // ✨ [FIX] Hapus user yang terkait sebelum menghapus karyawan
            if ($karyawan->user) {
                $karyawan->user->tokens()->delete(); // Hapus token API jika ada
                $karyawan->user->delete();
            }

            $karyawan->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Karyawan dan user terkait telah berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus karyawan: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal menghapus karyawan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the profile of the currently authenticated user.
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        // ✨ [FIX] Relasi yang lebih andal untuk mengambil data karyawan
        $karyawan = Karyawan::with(['jabatan', 'departemen'])->find($user->id_karyawan);

        if (!$karyawan) {
            return response()->json([
                'status' => false,
                'message' => 'Data karyawan tidak ditemukan untuk user ini',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Profil karyawan yang sedang login',
            'data' => $karyawan,
        ]);
    }
}
