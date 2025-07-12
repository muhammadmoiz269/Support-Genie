
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Users, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { knowledgeBaseService } from "@/services/knowledgeBaseService";
import type { Tables } from "@/integrations/supabase/types";

type CategoryUser = Tables<'category_users'>;
type UserCategoryAssignment = Tables<'user_category_assignments'>;

interface UserWithCategories extends CategoryUser {
  categories: string[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithCategories[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('category_users')
        .select('*')
        .order('name');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          title: "Error fetching users",
          description: "Could not load users",
          variant: "destructive",
        });
        return;
      }

      // Fetch user category assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('user_category_assignments')
        .select('*');

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        toast({
          title: "Error fetching assignments",
          description: "Could not load user assignments",
          variant: "destructive",
        });
        return;
      }

      // Combine users with their categories
      const usersWithCategories = usersData.map(user => ({
        ...user,
        categories: assignmentsData
          .filter(assignment => assignment.user_id === user.id)
          .map(assignment => assignment.category)
      }));

      setUsers(usersWithCategories);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const knowledgeBaseCategories = await knowledgeBaseService.getCategories();
      setCategories(knowledgeBaseCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter both name and email",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('category_users')
        .insert({
          name: newUser.name.trim(),
          email: newUser.email.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        toast({
          title: "Error creating user",
          description: "Could not create user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User created",
        description: `${data.name} has been added successfully`,
      });

      setNewUser({ name: '', email: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const assignCategory = async () => {
    if (!selectedUser || !selectedCategory) {
      toast({
        title: "Validation error",
        description: "Please select both user and category",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from('user_category_assignments')
        .select('id')
        .eq('user_id', selectedUser)
        .eq('category', selectedCategory)
        .single();

      if (existingAssignment) {
        toast({
          title: "Assignment exists",
          description: "This user is already assigned to this category",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_category_assignments')
        .insert({
          user_id: selectedUser,
          category: selectedCategory
        });

      if (error) {
        console.error('Error assigning category:', error);
        toast({
          title: "Error assigning category",
          description: "Could not assign category to user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Category assigned",
        description: "User has been assigned to the category successfully",
      });

      setSelectedUser('');
      setSelectedCategory('');
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const removeUserCategory = async (userId: string, category: string) => {
    try {
      const { error } = await supabase
        .from('user_category_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('category', category);

      if (error) {
        console.error('Error removing assignment:', error);
        toast({
          title: "Error removing assignment",
          description: "Could not remove category assignment",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Assignment removed",
        description: "Category assignment has been removed",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('category_users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error deleting user",
          description: "Could not delete user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User deleted",
        description: `${userName} has been deleted successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'API Issue': 'bg-red-100 text-red-800',
      'Transaction Delay': 'bg-orange-100 text-orange-800',
      'Onboarding': 'bg-green-100 text-green-800',
      'Product Flow': 'bg-blue-100 text-blue-800',
      'Inventory': 'bg-purple-100 text-purple-800',
      'Customer Management': 'bg-teal-100 text-teal-800',
      'Daily Operations': 'bg-indigo-100 text-indigo-800',
      'Hardware Support': 'bg-yellow-100 text-yellow-800',
      'Multi-Location': 'bg-pink-100 text-pink-800',
      'Gift Cards': 'bg-cyan-100 text-cyan-800',
      'Product Search & Filter': 'bg-lime-100 text-lime-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create User Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={createUser} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign Category Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Assign Category to User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={assignCategory} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Assign Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users & Category Assignments ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No users found.</p>
                <p className="text-sm">Create your first user to get started!</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Created {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id, user.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Assigned Categories ({user.categories.length}):
                    </p>
                    {user.categories.length === 0 ? (
                      <p className="text-sm text-gray-500">No categories assigned</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.categories.map((category) => (
                          <Badge
                            key={category}
                            className={`${getCategoryColor(category)} cursor-pointer hover:opacity-80`}
                            onClick={() => removeUserCategory(user.id, category)}
                          >
                            {category}
                            <Trash2 className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
