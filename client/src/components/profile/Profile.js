import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Star,
  Mail
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate', description: '' });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      location: user?.location || ''
    }
  });

  const handleProfileUpdate = async (data) => {
    try {
      const response = await axios.put('/api/users/profile', data);
      updateUser(response.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      toast.error('Skill name is required');
      return;
    }

    try {
      const response = await axios.post('/api/users/skills', newSkill);
      updateUser(response.data.user);
      setNewSkill({ name: '', level: 'intermediate', description: '' });
      setIsAddingSkill(false);
      toast.success('Skill added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const response = await axios.delete(`/api/users/skills/${skillId}`);
      updateUser(response.data.user);
      toast.success('Skill removed successfully!');
    } catch (error) {
      toast.error('Failed to remove skill');
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your profile and skills</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('location')}
                      className="input-field pl-10"
                      placeholder="Enter your location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio', { maxLength: { value: 500, message: 'Bio cannot exceed 500 characters' } })}
                    rows={4}
                    className={`input-field ${errors.bio ? 'border-red-500' : ''}`}
                    placeholder="Tell us about yourself..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <p className="text-gray-900">{user?.firstName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <p className="text-gray-900">{user?.lastName}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <p className="text-gray-900">@{user?.username}</p>
                </div>

                {user?.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{user.location}</p>
                    </div>
                  </div>
                )}

                {user?.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <p className="text-gray-900">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="card mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Skills</h2>
              <button
                onClick={() => setIsAddingSkill(!isAddingSkill)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Add Skill Form */}
            {isAddingSkill && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Skill</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., JavaScript, Python, Design"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Level
                    </label>
                    <select
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                      className="input-field"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                    rows={3}
                    className="input-field"
                    placeholder="Describe your experience with this skill..."
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setIsAddingSkill(false);
                      setNewSkill({ name: '', level: 'intermediate', description: '' });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button onClick={handleAddSkill} className="btn-primary">
                    Add Skill
                  </button>
                </div>
              </div>
            )}

            {/* Skills List */}
            {user?.skills && user.skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.skills.map((skill, index) => (
                  <div key={skill._id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{skill.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                        <button
                          onClick={() => handleRemoveSkill(skill._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {skill.description && (
                      <p className="text-sm text-gray-600">{skill.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h3>
                <p className="text-gray-600 mb-4">
                  Add your skills to start connecting with others who share your interests.
                </p>
                <button
                  onClick={() => setIsAddingSkill(true)}
                  className="btn-primary"
                >
                  Add Your First Skill
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="card">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-600 mb-2">@{user?.username}</p>
              {user?.location && (
                <div className="flex items-center justify-center text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{user.location}</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Skills</span>
                <span className="font-medium">{user?.skills?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Views</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connections</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 