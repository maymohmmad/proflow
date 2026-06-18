<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Register
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // إنشاء settings افتراضية للمستخدم
        UserSetting::create([
            'user_id' => $user->id,
        ]);

        $token = $user->createToken('proflow-token')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('proflow-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user'    => $user,
            'token'   => $token,
        ]);
    }
// Update Profile
public function updateProfile(Request $request)
{
    $request->validate([
        'name'  => 'sometimes|string|max:255',
        'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
    ]);

    $user = $request->user();
    $user->update($request->only(['name', 'email']));

    return response()->json([
        'message' => 'Profile updated successfully',
        'user'    => $user,
    ]);
}
// Update Password
public function updatePassword(Request $request)
{
    $request->validate([
        'current_password'  => 'required|string',
        'password'          => 'required|string|min:8|confirmed',
    ]);

    $user = $request->user();

    if (! Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'message' => 'Current password is incorrect',
        ], 422);
    }

    $user->update([
        'password' => Hash::make($request->password),
    ]);

    return response()->json([
        'message' => 'Password updated successfully',
    ]);
}
// Upload Avatar
public function uploadAvatar(Request $request)
{
    $request->validate([
        'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    $user = $request->user();

    $path = $request->file('avatar')->store('avatars', 'public');

    $user->update(['avatar' => $path]);

    return response()->json([
        'message' => 'Avatar updated successfully',
        'avatar' => url('storage/' . $path),
    ]);
}
// Delete Account
public function deleteAccount(Request $request)
{
    $user = $request->user();
    $user->tokens()->delete();
    $user->delete();

    return response()->json([
        'message' => 'Account deleted successfully',
    ]);
}
    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    // Get current user
   public function me(Request $request)
{
    $user = $request->user();

    return response()->json([
        'user' => [
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'avatar' => $user->avatar ? url('storage/' . $user->avatar) : null,
        ],
        'settings' => $user->settings,
    ]);
}
}