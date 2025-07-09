<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Karyawan;
use App\Models\Jabatan;
use App\Models\Departemen;

class KaryawanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $karyawans = Karyawan::with(['jabatan', 'departemen'])->get();
        return response()->json([
            'status' => true,
            'message' => 'Data Karyawan',
            'data' => $karyawans,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $jabatans = Jabatan::all();
        $departemens = Departemen::all();
        return response()->json([
            'status' => true,
            'message' => 'Form untuk membuat Karyawan baru',
            'data' => [
                'jabatans' => $jabatans,
                'departemens' => $departemens,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_jabatan' => 'required|exists:jabatans,id',
            'id_departemen' => 'required|exists:departemens,id',
            'nama_lengkap' => 'required|string|max:255',
            'nik_ktp' => 'nullable|string|max:16',
            'npwp' => 'nullable|string|max:20',
            'status_ptkp' => 'nullable|string|max:10',
            'tanggal_bergabung' => 'nullable|date',
            'gaji_pokok' => 'nullable|numeric',
            'nomor_rekening' => 'nullable|string|max:50',
            'nama_bank' => 'nullable|string|max:100',
            'status_kepegawaian' => 'nullable',
            'is_active' => 'boolean',
        ]);

        $karyawan = Karyawan::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Karyawan telah berhasil dibuat',
            'data' => $karyawan,
        ]);
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
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $karyawan = Karyawan::find($id);
        if (!$karyawan) {
            return response()->json([
                'status' => false,
                'message' => 'Karyawan tidak ditemukan',
            ], 404);
        }
        return response()->json([
            'status' => true,
            'message' => 'Karyawan telah berhasil ditemukan',
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

        $request->validate([
            'id_jabatan' => 'sometimes|required|exists:jabatans,id',
            'id_departemen' => 'sometimes|required|exists:departemens,id',
            'nama_lengkap' => 'sometimes|required|string|max:255',
            'nik_ktp' => 'nullable|string|max:16',
            'npwp' => 'nullable|string|max:20',
            'status_ptkp' => 'nullable|string|max:10',
            'tanggal_bergabung' => 'nullable|date',
            'gaji_pokok' => 'nullable|numeric',
            'nomor_rekening' => 'nullable|string|max:50',
            'nama_bank' => 'nullable|string|max:100',
            'status_kepegawaian' => 'nullable|in:Tetap,Kontrak,Harian',
            'is_active' => 'boolean',
        ]);

        $karyawan->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Karyawan telah berhasil diperbarui',
            'data' => $karyawan,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $karyawan = Karyawan::find($id);
        if (!$karyawan) {
            return response()->json([
                'status' => false,
                'message' => 'Karyawan tidak ditemukan',
            ], 404);
        }
        $karyawan->delete();
        return response()->json([
            'status' => true,
            'message' => 'Karyawan telah berhasil dihapus',
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->karyawan) {
            return response()->json([
                'status' => false,
                'message' => 'Karyawan tidak ditemukan untuk user ini',
                'data' => null,
            ], 404);
       }
        $karyawan = Karyawan::with(['jabatan', 'departemen'])->find($user->id_karyawan);
        return response()->json([
            'status' => true,
            'message' => 'Profil karyawan yang sedang login',
            'data' => $karyawan,
       ]);
    }

}
