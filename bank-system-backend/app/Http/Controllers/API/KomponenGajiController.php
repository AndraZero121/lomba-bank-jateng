<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KomponenGaji;

class KomponenGajiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $komponenGaji = KomponenGaji::all();
        return response()->json([
            "status" => true,
            "message" => "Data Komponen Gaji",
            "data" => $komponenGaji,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json([
            "status" => true,
            "message" => "Form untuk membuat Komponen Gaji baru",
            "data" => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_komponen' => 'required|string|max:255',
            'tipe' => 'required|in:Tunjangan,Potongan',
            'sifat' => 'required|in:Tetap,Tidak Tetap',
            'is_taxable' => 'boolean',
            'is_bpjs_base' => 'boolean',
        ]);

        $komponenGaji = KomponenGaji::create($request->all());

        return response()->json([
            "status" => true,
            "message" => "Komponen Gaji berhasil ditambahkan",
            "data" => $komponenGaji,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $komponenGaji = KomponenGaji::findOrFail($id);
        return response()->json([
            "status" => true,
            "message" => "Data Komponen Gaji",
            "data" => $komponenGaji,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $komponenGaji = KomponenGaji::findOrFail($id);
        return response()->json([
            "status" => true,
            "message" => "Data Komponen Gaji",
            "data" => $komponenGaji,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $komponenGaji = KomponenGaji::findOrFail($id);

        $request->validate([
            'nama_komponen' => 'sometimes|required|string|max:255',
            'tipe' => 'sometimes|required|in:Tunjangan,Potongan',
            'sifat' => 'sometimes|required|in:Tetap,Tidak Tetap',
            'is_taxable' => 'sometimes|boolean',
            'is_bpjs_base' => 'sometimes|boolean',
        ]);

        $komponenGaji->update($request->all());

        return response()->json([
            "status" => true,
            "message" => "Komponen Gaji berhasil diperbarui",
            "data" => $komponenGaji,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $komponenGaji = KomponenGaji::findOrFail($id);
        $komponenGaji->delete();

        return response()->json([
            "status" => true,
            "message" => "Komponen Gaji berhasil dihapus",
        ]);
    }
}
