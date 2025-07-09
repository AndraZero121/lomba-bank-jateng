<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SlipGaji;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SlipGajiExport;
class SlipGajiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $slipGaji = SlipGaji::with("karyawan.jabatan")->get();


        return response()->json([
            "status" => true,
            "message" => "Mengambil data SlipGaji",
            "data" => $slipGaji,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_payroll_run' => 'required|exists:payroll_run,id',
            'id_karyawan' => 'required|exists:karyawans,id',
            'gaji_pokok' => 'required|numeric',
            'total_tunjangan' => 'required|numeric',
            'total_potongan' => 'nullable|numeric',
            'penghasilan_bruto' => 'nullable|numeric',
            'pph21_terpotong' => 'nullable|numeric',
            'total_iuran_bpjs_kesehatan' => 'nullable|numeric',
            'thp' => 'nullable|numeric',
            'detail_json' => 'nullable|json',
        ]);

        try {
            // Hitung penghasilan bruto dari input (jangan gunakan nilai dari request jika ingin hitung ulang)
            $penghasilanBruto = $request->gaji_pokok + $request->total_tunjangan;

            // Hitung total potongan
            $totalPotongan = ($request->total_potongan ?? 0) + ($request->pph21_terpotong ?? 0) + ($request->total_iuran_bpjs_kesehatan ?? 0);

            // Hitung THP (Take Home Pay)
            $thp = $penghasilanBruto - $totalPotongan;

            // Buat data slip gaji
            $slipGaji = SlipGaji::create([
                'id_payroll_run' => $request->id_payroll_run,
                'id_karyawan' => $request->id_karyawan,
                'gaji_pokok' => $request->gaji_pokok,
                'total_tunjangan' => $request->total_tunjangan,
                'total_potongan' => $request->total_potongan ?? 0,
                'penghasilan_bruto' => $penghasilanBruto,
                'pph21_terpotong' => $request->pph21_terpotong ?? 0,
                'total_iuran_bpjs_kesehatan' => $request->total_iuran_bpjs_kesehatan ?? 0,
                'thp' => $thp,
                'detail_json' => $request->detail_json,
            ]);

            // Pastikan detail_json dikembalikan sebagai array jika valid JSON
            $data = $slipGaji->toArray();
            if (!empty($data['detail_json']) && is_string($data['detail_json'])) {
                $decoded = json_decode($data['detail_json'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data['detail_json'] = $decoded;
                }
            }

            return response()->json([
                "status" => true,
                "message" => "Slip Gaji berhasil dibuat",
                "data" => $data,
            ]);
        } catch (Exception) {
            return response()->json([
                "status" => false,
                "message" => "Terjadi error saat menambahkan Slip Gaji",
                "data" => null,
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $slipGaji = SlipGaji::findOrFail($id);
            return response()->json([
                "status" => true,
                "message" => "Berhasil menampilkan data SlipGaji",
                "data" => $slipGaji,
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                "status" => false,
                "message" => "Slip Gaji tidak ditemukan",
                "data" => null,
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'id_payroll_run' => 'sometimes|required|exists:payroll_run,id',
            'id_karyawan' => 'sometimes|required|exists:karyawans,id',
            'gaji_pokok' => 'sometimes|required|numeric',
            'total_tunjangan' => 'sometimes|required|numeric',
            'total_potongan' => 'nullable|numeric',
            'penghasilan_bruto' => 'nullable|numeric',
            'pph21_terpotong' => 'nullable|numeric',
            'total_iuran_bpjs_kesehatan' => 'nullable|numeric',
            'thp' => 'nullable|numeric',
            'detail_json' => 'nullable|json',
        ]);

        try {
            $slipGaji = SlipGaji::findOrFail($id);

            // Hitung penghasilan bruto dari input (jangan gunakan nilai dari request jika ingin hitung ulang)
            $gajiPokok = $request->has('gaji_pokok') ? $request->gaji_pokok : $slipGaji->gaji_pokok;
            $totalTunjangan = $request->has('total_tunjangan') ? $request->total_tunjangan : $slipGaji->total_tunjangan;
            $penghasilanBruto = $gajiPokok + $totalTunjangan;

            // Hitung total potongan
            $totalPotongan =
                ($request->has('total_potongan') ? $request->total_potongan : $slipGaji->total_potongan)
                + ($request->has('pph21_terpotong') ? $request->pph21_terpotong : $slipGaji->pph21_terpotong)
                + ($request->has('total_iuran_bpjs_kesehatan') ? $request->total_iuran_bpjs_kesehatan : $slipGaji->total_iuran_bpjs_kesehatan);

            // Hitung THP (Take Home Pay)
            $thp = $penghasilanBruto - $totalPotongan;

            $slipGaji->update([
                'id_payroll_run' => $request->has('id_payroll_run') ? $request->id_payroll_run : $slipGaji->id_payroll_run,
                'id_karyawan' => $request->has('id_karyawan') ? $request->id_karyawan : $slipGaji->id_karyawan,
                'gaji_pokok' => $gajiPokok,
                'total_tunjangan' => $totalTunjangan,
                'total_potongan' => $request->has('total_potongan') ? $request->total_potongan : $slipGaji->total_potongan,
                'penghasilan_bruto' => $penghasilanBruto,
                'pph21_terpotong' => $request->has('pph21_terpotong') ? $request->pph21_terpotong : $slipGaji->pph21_terpotong,
                'total_iuran_bpjs_kesehatan' => $request->has('total_iuran_bpjs_kesehatan') ? $request->total_iuran_bpjs_kesehatan : $slipGaji->total_iuran_bpjs_kesehatan,
                'thp' => $thp,
                'detail_json' => $request->has('detail_json') ? $request->detail_json : $slipGaji->detail_json,
            ]);

            // Pastikan detail_json dikembalikan sebagai array jika valid JSON
            $data = $slipGaji->toArray();
            if (!empty($data['detail_json']) && is_string($data['detail_json'])) {
                $decoded = json_decode($data['detail_json'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data['detail_json'] = $decoded;
                }
            }

            return response()->json([
                "status" => true,
                "message" => "Slip Gaji berhasil diupdate",
                "data" => $data,
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                "status" => false,
                "message" => "Slip Gaji tidak ditemukan",
                "data" => null,
            ], 404);
        } catch (Exception) {
            return response()->json([
                "status" => false,
                "message" => "Terjadi error saat mengupdate Slip Gaji",
                "data" => null,
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $slipGaji = SlipGaji::findOrFail($id);
            $slipGaji->delete();

            return response()->json([
                "status" => true,
                "message" => "Slip Gaji berhasil dihapus",
                "data" => null,
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                "status" => false,
                "message" => "Slip Gaji tidak ditemukan",
                "data" => null,
            ], 404);
        } catch (Exception) {
            return response()->json([
                "status" => false,
                "message" => "Terjadi error saat menghapus Slip Gaji",
                "data" => null,
            ], 500);
        }
    }
    public function exportPdf()
    {
        $data = SlipGaji::all();
        $pdf = Pdf::loadView('exports.slipgaji', compact('data'));
        return $pdf->download('slip_gaji.pdf');
    }

    public function exportExcel()
    {
        return Excel::download(new SlipGajiExport, 'slip_gaji.xlsx');
    }
}
