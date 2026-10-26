<?php

namespace App\Http\Controllers;

use App\Models\Buku;

class BukuController extends Controller
{
    public function index()
    {
        $buku = Buku::with('kategori')->get();
        return view('buku.index', ['buku' => $buku]);
    }

    public function show($id)
    {
        $buku = Buku::with('kategori')->find($id);
        return view('buku.show', ['buku' => $buku]);
    }
}