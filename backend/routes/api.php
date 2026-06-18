<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\SettingController;




Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working 🚀'
    ]);
});

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Projects
    Route::apiResource('projects', ProjectController::class);

    // Tasks
    Route::get('projects/{project}/tasks',           [TaskController::class, 'index']);
    Route::post('projects/{project}/tasks',          [TaskController::class, 'store']);
    Route::put('projects/{project}/tasks/{task}',    [TaskController::class, 'update']);
    Route::delete('projects/{project}/tasks/{task}', [TaskController::class, 'destroy']);

    // Settings
    Route::get('/settings',  [SettingController::class, 'show']);
    Route::put('/settings',  [SettingController::class, 'update']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/auth/account', [AuthController::class, 'deleteAccount']);
});