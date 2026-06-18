<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{ use HasFactory;
 protected $fillable = [
        'project_id', 'title', 'description','status', 'priority', 'due_date', 'position',];

    protected $casts = [
        'due_date' => 'date',
    ];
 // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }}