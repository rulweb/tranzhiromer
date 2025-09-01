<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Models\PaymentAllocation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {

        return Inertia::render('Lk/Index', []);
    }
}
