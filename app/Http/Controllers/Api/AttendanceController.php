<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Attendance;
use App\Models\Staff;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Staff $staff): JsonResponse
    {
        return response()->json($staff->attendances()->orderBy('date', 'desc')->get());
    }

    public function allAttendances(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role === 'staff') {
            $staff = Staff::where('user_id', $user->id)->first();
            if (!$staff) return response()->json([]);
            return response()->json(
                Attendance::where('staff_id', $staff->id)
                    ->orderBy('date', 'desc')
                    ->get()
            );
        }

        // Admin view: all attendances with staff details
        $attendances = Attendance::with('staff:id,name,role')
            ->where('business_id', $user->business_id)
            ->orderBy('date', 'desc')
            ->get();
            
        return response()->json($attendances);
    }

    public function clockIn(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'staff') {
            return response()->json(['message' => 'Only staff can clock in.'], 403);
        }

        $staff = Staff::where('user_id', $user->id)->first();
        if (!$staff) {
            return response()->json(['message' => 'Staff profile not found.'], 404);
        }

        $today = Carbon::today()->toDateString();
        
        $attendance = Attendance::firstOrCreate(
            ['staff_id' => $staff->id, 'date' => $today],
            ['business_id' => $user->business_id]
        );

        if ($attendance->clock_in_time) {
            return response()->json(['message' => 'Already clocked in today.'], 400);
        }

        $location = null;
        if ($request->has('latitude') && $request->has('longitude')) {
            $location = $request->latitude . ',' . $request->longitude;
        }

        $attendance->update([
            'clock_in_time' => Carbon::now(),
            'clock_in_location' => $location
        ]);

        return response()->json(['message' => 'Clocked in successfully.', 'attendance' => $attendance]);
    }

    public function clockOut(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'staff') {
            return response()->json(['message' => 'Only staff can clock out.'], 403);
        }

        $staff = Staff::where('user_id', $user->id)->first();
        if (!$staff) {
            return response()->json(['message' => 'Staff profile not found.'], 404);
        }

        $today = Carbon::today()->toDateString();
        
        $attendance = Attendance::where('staff_id', $staff->id)->where('date', $today)->first();

        if (!$attendance || !$attendance->clock_in_time) {
            return response()->json(['message' => 'You have not clocked in today.'], 400);
        }

        if ($attendance->clock_out_time) {
            return response()->json(['message' => 'Already clocked out today.'], 400);
        }

        $location = null;
        if ($request->has('latitude') && $request->has('longitude')) {
            $location = $request->latitude . ',' . $request->longitude;
        }

        $attendance->update([
            'clock_out_time' => Carbon::now(),
            'clock_out_location' => $location
        ]);

        return response()->json(['message' => 'Clocked out successfully.', 'attendance' => $attendance]);
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'staff') {
            return response()->json(['status' => 'not_staff']);
        }

        $staff = Staff::where('user_id', $user->id)->first();
        if (!$staff) {
            return response()->json(['status' => 'no_profile']);
        }

        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('staff_id', $staff->id)->where('date', $today)->first();

        if (!$attendance || !$attendance->clock_in_time) {
            return response()->json(['status' => 'pending']);
        }

        if ($attendance->clock_in_time && !$attendance->clock_out_time) {
            return response()->json(['status' => 'clocked_in', 'time' => $attendance->clock_in_time]);
        }

        return response()->json(['status' => 'clocked_out', 'in_time' => $attendance->clock_in_time, 'out_time' => $attendance->clock_out_time]);
    }
}
