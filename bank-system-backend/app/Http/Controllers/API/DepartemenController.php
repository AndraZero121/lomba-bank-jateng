<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Departemen;
use Illuminate\Support\Facades\Log;

class DepartemenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $departemen = Departemen::all();
        return response()->json([
            "status" => true,
            "message" => "Data Departemen",
            "data" => $departemen,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Log::info('Menerima permintaan untuk membuat Departemen baru');
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
        // Proses validasi
        Log::info('Menerima permintaan untuk menambahkan departemen', [
            'request' => $request->all(),
        ]);

        $request->validate([
            'nama_departemen' => 'required|string|max:255',
        ]);

        // Simpan data ke database
        $departemen = Departemen::create([
            'nama_departemen' => $request->input('nama_departemen'),
        ]);

        // Cek apakah penyimpanan berhasil
        if (!$departemen) {
            Log::error('Gagal menambahkan departemen', [
                'request' => $request->all(),
            ]);
            return response()->json([
                "status" => false,
                "message" => "Gagal menambahkan departemen",
            ], 500);
        }
        Log::info('Departemen berhasil ditambahkan', [
            'departemen' => $departemen,
        ]);
        return response()->json([
            "status" => true,
            "message" => "Departemen telah ditambahkan",
            "data" => $departemen,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $departemen = Departemen::find($id);
        if (!$departemen) {
            return response()->json([
                "status" => false,
                "message" => "Departemen tidak ditemukan",
                "data" => null,
            ], 404);
        }
        return response()->json([
            "status" => true,
            "message" => "Data Departemen",
            "data" => $departemen,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        Log::info('Menerima permintaan untuk mengedit Departemen', [
            'id' => $id,
        ]);
        $departemen = Departemen::find($id);
        if (!$departemen) {
            Log::error('Departemen tidak ditemukan', [
                'id' => $id,
            ]);
            return response()->json([
                "status" => false,
                "message" => "Departemen tidak ditemukan",
                "data" => null,
            ], 404);
        }
        return response()->json([
            "status" => true,
            "message" => "Departemen telah berhasil ditemukan",
            "data" => $departemen,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Proses validasi
        Log::info('Menerima permintaan untuk memperbarui departemen', [
            'request' => $request->all(),
            'id' => $id,
        ]);

        $request->validate([
            'nama_departemen' => 'required|string|max:255',
        ]);

        // Temukan departemen berdasarkan ID
        $departemen = Departemen::find($id);
        if (!$departemen) {
            Log::error('Departemen tidak ditemukan', ['id' => $id]);
            return response()->json([
                "status" => false,
                "message" => "Departemen tidak ditemukan",
            ], 404);
        }

        // Perbarui data departemen
        $departemen->update([
            'nama_departemen' => $request->input('nama_departemen'),
        ]);

        Log::info('Departemen berhasil diperbarui', [
            'departemen' => $departemen,
        ]);
        return response()->json([
            "status" => true,
            "message" => "Departemen telah diperbarui",
            "data" => $departemen,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Proses validasi
        Log::info('Menerima permintaan untuk menghapus departemen', [
            'id' => $id,
        ]);

        // Temukan departemen berdasarkan ID
        $departemen = Departemen::find($id);
        if (!$departemen) {
            Log::error('Departemen tidak ditemukan', ['id' => $id]);
            return response()->json([
                "status" => false,
                "message" => "Departemen tidak ditemukan",
            ], 404);
        }
        // Hapus departemen
        $departemen->delete();
        Log::info('Departemen berhasil dihapus', [
            'id' => $id,
        ]);
        return response()->json([
            "status" => true,
            "message" => "Departemen telah dihapus",
        ], 200);
    }
}
