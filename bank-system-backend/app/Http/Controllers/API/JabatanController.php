<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Jabatan;

class JabatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jabatans = Jabatan::all();
        return response()->json([
            "status" => true,
            "message" => "Data Jabatan",
            "data" => $jabatans,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Log::info('Menerima permintaan untuk membuat Jabatan baru');
        return response()->json([
            "status" => true,
            "message" => "Form untuk membuat Jabatan baru",
            "data" => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_jabatan' => 'required|string|max:255',
        ]);
        Log::info('Menerima permintaan untuk menyimpan Jabatan baru', [
            'request' => $request->all(),
        ]);
        $jabatan = Jabatan::create([
            'nama_jabatan' => $request->input('nama_jabatan'),
        ]);
        if (!$jabatan) {
            Log::error('Gagal menyimpan Jabatan baru', [
                'request' => $request->all(),
            ]);
            return response()->json([
                "status" => false,
                "message" => "Gagal menyimpan Jabatan baru",
                "data" => null,
            ], 500);
        }
        Log::info('Jabatan baru berhasil disimpan', [
            'jabatan' => $jabatan,
        ]);
        return response()->json([
            "status" => true,
            "message" => "Jabatan baru telah disimpan",
            "data" => $jabatan,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $jabatan = Jabatan::find($id);
        if (!$jabatan) {
            return response()->json([
                "status" => false,
                "message" => "Jabatan tidak ditemukan",
                "data" => null,
            ], 404);
        }
        return response()->json([
            "status" => true,
            "message" => "Data Jabatan",
            "data" => $jabatan,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        Log::info('Menerima permintaan untuk mengedit Jabatan', [
            'id' => $id,
        ]);
        $jabatan = Jabatan::find($id);
        if (!$jabatan) {
            Log::error('Jabatan tidak ditemukan', [
                'id' => $id,
            ]);
            return response()->json([
                "status" => false,
                "message" => "Jabatan tidak ditemukan",
                "data" => null,
            ], 404);
        }
        return response()->json([
            "status" => true,
            "message" => "Jabatan telah berhasil ditemukan",
            "data" => $jabatan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nama_jabatan' => 'required|string|max:255',
        ]);
        Log::info('Menerima permintaan untuk memperbarui Jabatan', [
            'id' => $id,
            'request' => $request->all(),
        ]);
        $jabatan = Jabatan::find($id);
        if (!$jabatan) {
            Log::error('Jabatan tidak ditemukan', [
                'id' => $id,
            ]);
            return response()->json([
                "status" => false,
                "message" => "Jabatan tidak ditemukan",
                "data" => null,
            ], 404);
        }
        $jabatan->update([
            'nama_jabatan' => $request->input('nama_jabatan'),
        ]);
        Log::info('Jabatan berhasil diperbarui', [
            'id' => $id,
            'jabatan' => $jabatan,
        ]);
        return response()->json([
            "status" => true,
            "message" => "Jabatan telah diperbarui",
            "data" => $jabatan,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Log::info('Menerima permintaan untuk menghapus Jabatan', [
            'id' => $id,
        ]);
        $jabatan = Jabatan::find($id);
        if (!$jabatan) {
            Log::error('Jabatan tidak ditemukan', [
                'id' => $id,
            ]);
            return response()->json([
                "status" => false,
                "message" => "Jabatan tidak ditemukan",
                "data" => null,
            ], 404);
        }
        $jabatan->delete();
        Log::info('Jabatan berhasil dihapus', [
            'id' => $id,
        ]);
        return response()->json([
            "status" => true,
            "message" => "Jabatan telah dihapus",
            "data" => null,
        ]);
    }
}
