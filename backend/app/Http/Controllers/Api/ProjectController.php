<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // جلب كل مشاريع المستخدم
    public function index(Request $request)
    {
        $projects = $request->user()->projects()->latest()->get();

        return response()->json($projects);
    }

    // إنشاء مشروع جديد
    public function store(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'project_type' => 'in:personal,work,freelance,study',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date|after_or_equal:start_date',
        ]);

        $project = $request->user()->projects()->create($request->all());

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project,
        ], 201);
    }

    // جلب مشروع واحد
    public function show(Request $request, $id)
    {
        $project = $request->user()->projects()->with('tasks')->find($id);

        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        return response()->json($project);
    }

    // تعديل مشروع
    public function update(Request $request, $id)
    {
        $project = $request->user()->projects()->find($id);

        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $request->validate([
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'project_type' => 'sometimes|in:personal,work,freelance,study',
            'status'       => 'sometimes|in:active,completed,archived',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date',
        ]);

        $project->update($request->all());

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project,
        ]);
    }

    // حذف مشروع
    public function destroy(Request $request, $id)
    {
        $project = $request->user()->projects()->find($id);

        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ]);
    }
}