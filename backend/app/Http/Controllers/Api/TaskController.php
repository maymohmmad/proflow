<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // جلب كل tasks لمشروع معين
    public function index(Request $request, $projectId)
    {
        $project = $request->user()->projects()->find($projectId);

        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $tasks = $project->tasks()->orderBy('position')->get();

        return response()->json($tasks);
    }

    // إنشاء task جديد
    public function store(Request $request, $projectId)
    {
        $project = $request->user()->projects()->find($projectId);

        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'in:todo,in_progress,done',
            'priority'    => 'in:low,medium,high',
            'due_date'    => 'nullable|date',
            'position'    => 'nullable|integer',
        ]);

        $task = $project->tasks()->create($request->all());

        return response()->json([
            'message' => 'Task created successfully',
            'task'    => $task,
        ], 201);
    }

    // تعديل task
    public function update(Request $request, $projectId, $taskId)
    {
        $project = $request->user()->projects()->find($projectId);

        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $task = $project->tasks()->find($taskId);

        if (! $task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:todo,in_progress,done',
            'priority'    => 'sometimes|in:low,medium,high',
            'due_date'    => 'nullable|date',
            'position'    => 'nullable|integer',
        ]);

        $task->update($request->all());

        return response()->json([
            'message' => 'Task updated successfully',
            'task'    => $task,
        ]);
    }

    // حذف task
    public function destroy(Request $request, $projectId, $taskId)
    {
        $project = $request->user()->projects()->find($projectId);

        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $task = $project->tasks()->find($taskId);

        if (! $task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }
}