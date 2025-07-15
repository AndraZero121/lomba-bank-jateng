<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\PayrollRun;
use App\Models\SlipGaji;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Card Summaries
        $total_gaji = SlipGaji::whereMonth('created_at', Carbon::now()->month)
                              ->whereYear('created_at', Carbon::now()->year)
                              ->sum('thp');
        $jumlah_karyawan = Karyawan::where('is_active', true)->count();
        $payroll_runs = PayrollRun::whereIn('status', ['Final', 'Approve'])->count();
        $karyawan_baru_bulan_ini = Karyawan::whereMonth('created_at', Carbon::now()->month)
                                           ->whereYear('created_at', Carbon::now()->year)
                                           ->count();

        // Payroll Trend (Last 6 months)
        $payrollTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->format('M');
            $total = SlipGaji::whereYear('created_at', $date->year)
                             ->whereMonth('created_at', $date->month)
                             ->sum('thp');
            $payrollTrend['labels'][] = $monthName;
            $payrollTrend['data'][] = (int) $total;
        }
        $payrollTrendData = [
            'labels' => $payrollTrend['labels'],
            'datasets' => [
                [
                    'label' => 'Total Penggajian (Rp)',
                    'data' => $payrollTrend['data'],
                ]
            ]
        ];

        // Payroll Distribution
        $totalKaryawanForDist = Karyawan::where('is_active', true)->where('gaji_pokok', '>', 0)->count();
        if ($totalKaryawanForDist > 0) {
            $range1 = Karyawan::where('is_active', true)->where('gaji_pokok', '<', 5000000)->count();
            $range2 = Karyawan::where('is_active', true)->whereBetween('gaji_pokok', [5000000, 10000000])->count();
            $range3 = Karyawan::where('is_active', true)->where('gaji_pokok', '>', 10000000)->count();

            $payrollDistribution = [
                [
                    'range' => '< Rp 5.000.000',
                    'count' => $range1,
                    'percentage' => round(($range1 / $totalKaryawanForDist) * 100)
                ],
                [
                    'range' => 'Rp 5.000.000 - Rp 10.000.000',
                    'count' => $range2,
                    'percentage' => round(($range2 / $totalKaryawanForDist) * 100)
                ],
                [
                    'range' => '> Rp 10.000.000',
                    'count' => $range3,
                    'percentage' => round(($range3 / $totalKaryawanForDist) * 100)
                ]
            ];
        } else {
            $payrollDistribution = [];
        }


        // Recent Activities
        $recentPayroll = SlipGaji::with('karyawan')->latest()->take(3)->get();
        $recentKaryawan = Karyawan::latest()->take(2)->get();

        $activities = [];
        foreach ($recentPayroll as $payroll) {
            if ($payroll->karyawan) {
                $activities[] = [
                    'date' => $payroll->created_at,
                    'activity' => 'Penggajian Diproses',
                    'detail' => 'Slip gaji dibuat untuk ' . $payroll->karyawan->nama_lengkap
                ];
            }
        }
        foreach ($recentKaryawan as $karyawan) {
            $activities[] = [
                'date' => $karyawan->created_at,
                'activity' => 'Karyawan Ditambahkan',
                'detail' => 'Karyawan baru: ' . $karyawan->nama_lengkap
            ];
        }

        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        $recentActivities = array_slice($activities, 0, 5);


        // Combine all data
        $data = [
            'total_gaji' => $total_gaji,
            'jumlah_karyawan' => $jumlah_karyawan,
            'payroll_runs' => $payroll_runs,
            'karyawan_baru_bulan_ini' => $karyawan_baru_bulan_ini,
            'payrollDistribution' => $payrollDistribution,
            'payrollTrendData' => $payrollTrendData,
            'recentActivities' => $recentActivities,
        ];

        return response()->json([
            'status' => true,
            'message' => 'Data dasbor berhasil dimuat',
            'data' => $data,
        ]);
    }
}
