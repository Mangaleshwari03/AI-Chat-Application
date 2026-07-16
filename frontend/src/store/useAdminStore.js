import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useAdminStore = create((set, get) => ({
  stats: { totalUsers: 0, totalMessages: 0, totalGroups: 0 },
  users: [],
  groups: [],
  isLoading: false,

  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('/admin/stats');
      set({
        stats: res.data.stats,
        users: res.data.users,
        groups: res.data.groups,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBlockUser: async (userId) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${userId}/block`);
      const { user, message } = res.data;
      
      set((state) => ({
        users: state.users.map((u) => 
          u.id === userId ? { ...u, isBlocked: user.isBlocked } : u
        )
      }));
      toast.success(message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle block status');
    }
  },

  deleteUser: async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId)
      }));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  deleteGroup: async (groupId) => {
    if (!window.confirm("Are you sure you want to permanently delete this group?")) return;
    try {
      await axiosInstance.delete(`/admin/groups/${groupId}`);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId)
      }));
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete group');
    }
  }
}));
