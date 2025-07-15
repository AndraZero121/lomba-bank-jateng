<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PayrollRun;

class PayrollRunController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payrollRun = PayrollRun::all();
                return response()->json([
            "status" => true,
            "message" => "Data Komponen Gaji",
            "data" => $payrollRun,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json([
            "status" => true,
            "message" => "Form untuk membuat Payroll Run baru",
            "data" => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'periode_gaji' => 'required|string|max:255',
            'tanggal_eksekusi' => 'required|date',
            'status' => 'required|in:Draft,Final,Approve,Failed',
            'dieksekusi_oleh' => 'required|integer',
        ]);

        $payrollRun = PayrollRun::create($request->all());

        if(!$payrollRun){
            return response()->json([
                "status" => false,
                "message" => "Terdapat error saat menambahkan",
                "data" => null,
            ]);
        }

        return response()->json([
            "status" => true,
            "message" => 'PayrollRun berhasil ditambahkan',
            "data" => $payrollRun,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $payrollRun = PayrollRun::findOrFail($id);
        return response()->json([
            "status" => true,
            "message" => "Berhasil menampilkan data PayrollRun",
            "data" => $payrollRun,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $payrollRun = PayrollRun::findOrFail($id);
        return response()->json([
            "status" => true,
            "message" => "Menampilkan Edit PayrollRun",
            "data" => $payrollRun,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $payrollRun = PayrollRun::findOrFail($id);

        $request->validate([
            'periode_gaji' => 'required|string|max:255',
            'tanggal_eksekusi' => 'required|date',
            'status' => 'required|in:Draft,Final,Approve,Failed',
            'dieksekusi_oleh' => 'required|integer',
        ]);

        $payrollRun->update($request->all());

        if(!$payrollRun){
            return response()->json([
                "status" => false,
                "message" => "Terjadi kesalahan saat mengupdate data",
                "data" => $payrollRun,
            ]);
        }

        return response()->json([
            "status" => true,
            "message" => "Data berhasil ditambahkan",
            "data" => $payrollRun,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $payrollRun = PayrollRun::findOrFail($id);
        $payrollRun->delete();
        
        return response()->json([
            "status" => true,
            "message" => "Data berhasil dihapus",
        ]);

    }
}
