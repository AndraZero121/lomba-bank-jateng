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
use Illuminate\Support\Facades\Log;

class SlipGajiController extends Controller
{
    public function index()
    {
        Log::info('Mengambil semua data SlipGaji');
        $slipGaji = SlipGaji::with("karyawan.jabatan")->get();

        return response()->json([
            "status" => true,
            "message" => "Mengambil data SlipGaji",
            "data" => $slipGaji,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Mencoba membuat Slip Gaji', ['payload' => $request->all()]);

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
            $penghasilanBruto = $request->gaji_pokok + $request->total_tunjangan;
            $totalPotongan = ($request->total_potongan ?? 0) + ($request->pph21_terpotong ?? 0) + ($request->total_iuran_bpjs_kesehatan ?? 0);
            $thp = $penghasilanBruto - $totalPotongan;

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

            Log::info('Slip Gaji berhasil dibuat', ['id' => $slipGaji->id]);

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
        } catch (Exception $e) {
            Log::error('Gagal membuat Slip Gaji', ['error' => $e->getMessage()]);
            return response()->json([
                "status" => false,
                "message" => "Terjadi error saat menambahkan Slip Gaji",
                "data" => null,
            ], 500);
        }
    }

    public function show(string $id)
    {
        Log::info("Mengambil Slip Gaji ID: $id");
        try {
            $slipGaji = SlipGaji::findOrFail($id);
            return response()->json([
                "status" => true,
                "message" => "Berhasil menampilkan data SlipGaji",
                "data" => $slipGaji,
            ]);
        } catch (ModelNotFoundException) {
            Log::warning("Slip Gaji tidak ditemukan (ID: $id)");
            return response()->json([
                "status" => false,
                "message" => "Slip Gaji tidak ditemukan",
                "data" => null,
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        Log::info("Mencoba update Slip Gaji ID: $id", ['payload' => $request->all()]);

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

            $gajiPokok = $request->has('gaji_pokok') ? $request->gaji_pokok : $slipGaji->gaji_pokok;
            $totalTunjangan = $request->has('total_tunjangan') ? $request->total_tunjangan : $slipGaji->total_tunjangan;
            $penghasilanBruto = $gajiPokok + $totalTunjangan;

            $totalPotongan =
                ($request->has('total_potongan') ? $request->total_potongan : $slipGaji->total_potongan)
                + ($request->has('pph21_terpotong') ? $request->pph21_terpotong : $slipGaji->pph21_terpotong)
                + ($request->has('total_iuran_bpjs_kesehatan') ? $request->total_iuran_bpjs_kesehatan : $slipGaji->total_iuran_bpjs_kesehatan);

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

            Log::info("Berhasil update Slip Gaji", ['id' => $id]);

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
            Log::warning("Gagal update, Slip Gaji tidak ditemukan (ID: $id)");
            return response()->json([
                "status" => false,
                "message" => "Slip Gaji tidak ditemukan",
                "data" => null,
            ], 404);
        } catch (Exception $e) {
            Log::error("Gagal update Slip Gaji", ['error' => $e->getMessage()]);
            return response()->json([
                "status" => false,
                "message" => "Terjadi error saat mengupdate Slip Gaji",
                "data" => null,
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        Log::info("Mencoba hapus Slip Gaji ID: $id");
        try {
            $slipGaji = SlipGaji::findOrFail($id);
            $slipGaji->delete();

            Log::info("Slip Gaji berhasil dihapus", ['id' => $id]);
            return response()->json([
                "status" => true,
                "message" => "Slip Gaji berhasil dihapus",
                "data" => null,
            ]);
        } catch (ModelNotFoundException) {
            Log::warning("Gagal hapus, Slip Gaji tidak ditemukan (ID: $id)");
            return response()->json([
                "status" => false,
                "message" => "Slip Gaji tidak ditemukan",
                "data" => null,
            ], 404);
        } catch (Exception $e) {
            Log::error("Terjadi error saat menghapus Slip Gaji", ['error' => $e->getMessage()]);
            return response()->json([
                "status" => false,
                "message" => "Terjadi error saat menghapus Slip Gaji",
                "data" => null,
            ], 500);
        }
    }

    public function exportPdf()
    {
        Log::info("Export PDF Slip Gaji dimulai");
        $data = SlipGaji::all();
        $pdf = Pdf::loadView('exports.slipgaji', compact('data'));
        return $pdf->download('slip_gaji.pdf');
    }

    public function exportExcel()
    {
        Log::info("Export Excel Slip Gaji dimulai");
        return Excel::download(new SlipGajiExport, 'slip_gaji.xlsx');
    }
}
