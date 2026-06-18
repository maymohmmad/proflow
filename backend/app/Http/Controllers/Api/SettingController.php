<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // جلب settings المستخدم
    public function show(Request $request)
    {
        $settings = $request->user()->settings;

        return response()->json($settings);
    }

    // تعديل settings
    public function update(Request $request)
    {
        $request->validate([
            'theme'                  => 'sometimes|in:light,dark',
            'accent_color'           => 'sometimes|in:blue,purple,green,red',
            'layout_density'         => 'sometimes|in:compact,comfortable',
            'notifications_enabled'  => 'sometimes|boolean',
        ]);

        $settings = $request->user()->settings;
        $settings->update($request->all());

        return response()->json([
            'message'  => 'Settings updated successfully',
            'settings' => $settings,
        ]);
    }
}