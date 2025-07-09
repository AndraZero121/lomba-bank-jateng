<?php

namespace App\Exports;

use App\Models\SlipGaji;
use Maatwebsite\Excel\Concerns\FromCollection;

class SlipGajiExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return SlipGaji::all();
    }
}
