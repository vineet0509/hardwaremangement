<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Business extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'gst_number',
        'domain',
        'is_active',
        'trial_ends_at',
        'parent_id',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function settings()
    {
        return $this->hasOne(Setting::class);
    }

    public function parent()
    {
        return $this->belongsTo(Business::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Business::class, 'parent_id');
    }
}
