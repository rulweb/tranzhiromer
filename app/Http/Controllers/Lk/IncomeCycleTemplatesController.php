<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Models\IncomeCycleTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeCycleTemplatesController extends Controller
{
    public function index(Request $request): Response
    {
        $templates = IncomeCycleTemplate::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('sequence')
            ->get();

        return Inertia::render('Lk/IncomeCycleTemplates/Index', [
            'templates' => $templates,
        ]);
    }
}
