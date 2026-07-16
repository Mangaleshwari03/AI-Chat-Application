import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useAdminStore } from "../store/useAdminStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { Users, MessageSquare, LayoutGrid, BrainCircuit, LogOut, Search, ShieldBan, ShieldCheck, Trash2, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';

function AdminDashboard() {
  const { authUser, logout } = useAuthStore();
  const { stats, users, groups, fetchDashboardData, isLoading, toggleBlockUser, deleteUser, deleteGroup } = useAdminStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading && !users.length) return <div className="text-white text-center">Loading Admin Panel...</div>;

  return (
    <div className="relative w-full max-w-6xl h-[800px]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE (Admin Sidebar) */}
        <div className="w-80 bg-slate-800/80 backdrop-blur-md flex flex-col border-r border-slate-700/50">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Admin Panel</h1>
                <p className="text-xs text-slate-400">Welcome, {authUser?.fullName}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-2">
            <button onClick={() => setActiveTab("overview")} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "overview" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"}`}>
              <LayoutGrid className="w-5 h-5" />
              <span className="font-medium text-sm">Overview</span>
            </button>
            <button onClick={() => setActiveTab("users")} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "users" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"}`}>
              <Users className="w-5 h-5" />
              <span className="font-medium text-sm">Manage Users</span>
            </button>
            <button onClick={() => setActiveTab("groups")} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "groups" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"}`}>
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium text-sm">Monitor Groups</span>
            </button>
            <button onClick={() => setActiveTab("ai")} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "ai" ? "bg-green-500/20 text-green-300 border border-green-500/30" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"}`}>
              <BrainCircuit className="w-5 h-5" />
              <span className="font-medium text-sm">AI Control Center</span>
            </button>
          </div>

          <div className="p-4 border-t border-slate-700/50 flex flex-col gap-2">
            <button onClick={() => window.location.href = '/'} className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-slate-700/30 text-slate-300 hover:bg-slate-700/60 transition-all font-medium text-sm border border-slate-600/30">
              <MessageSquare className="w-4 h-4" />
              Return to Chat
            </button>
            <button onClick={logout} className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-medium text-sm border border-red-500/20">
              <LogOut className="w-4 h-4" />
              System Logout
            </button>
          </div>
        </div>

        {/* RIGHT SIDE (Content Area) */}
        <div className="flex-1 overflow-y-auto bg-slate-900/60 backdrop-blur-md p-8">
          
          {/* CONTENT: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-indigo-500/20 p-6 rounded-2xl shadow-[0_0_20px_-10px_rgba(99,102,241,0.3)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Total Users</h3>
                    <div className="bg-indigo-500/20 p-2 rounded-lg"><Users className="w-5 h-5 text-indigo-400" /></div>
                  </div>
                  <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                
                <div className="bg-slate-800/50 border border-purple-500/20 p-6 rounded-2xl shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Total Groups</h3>
                    <div className="bg-purple-500/20 p-2 rounded-lg"><MessageSquare className="w-5 h-5 text-purple-400" /></div>
                  </div>
                  <p className="text-4xl font-bold text-white">{stats.totalGroups}</p>
                </div>

                <div className="bg-slate-800/50 border border-cyan-500/20 p-6 rounded-2xl shadow-[0_0_20px_-10px_rgba(6,182,212,0.3)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Total Messages</h3>
                    <div className="bg-cyan-500/20 p-2 rounded-lg"><MessageSquare className="w-5 h-5 text-cyan-400" /></div>
                  </div>
                  <p className="text-4xl font-bold text-white">{stats.totalMessages}</p>
                </div>
              </div>

              {/* CHARTS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* 1. Message Activity Line Chart */}
                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-white font-semibold">Message Activity (Last 7 Days)</h3>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.messageActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748b" 
                          fontSize={12} 
                          tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. User Roles Pie Chart */}
                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <PieIcon className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-white font-semibold">User Role Distribution</h3>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.roleDistribution}
                          dataKey="count"
                          nameKey="role"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.roleDistribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : "#22d3ee"} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT: USERS */}
          {activeTab === "users" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">Manage Users</h2>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-slate-400 text-sm border-b border-slate-700">
                      <th className="p-4 font-medium">User Profile</th>
                      <th className="p-4 font-medium">Email Address</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={user.profilePic || "/avatar.png"} alt="profile" className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                          <span className="text-white font-medium">{user.fullName}</span>
                        </td>
                        <td className="p-4 text-slate-300 text-sm">{user.email}</td>
                        <td className="p-4">
                          {user.isBlocked ? (
                            <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/20">Blocked</span>
                          ) : (
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20">Active</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => toggleBlockUser(user.id)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${user.isBlocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                            {user.isBlocked ? "Unblock" : "Block User"}
                          </button>
                          <button onClick={() => deleteUser(user.id)} className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center p-8 text-slate-500">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTENT: GROUPS */}
          {activeTab === "groups" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">Monitor Study Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(group => (
                  <div key={group.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-white truncate max-w-[200px]">{group.name}</h3>
                        {group.isStudyCircle ? (
                          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-md text-[10px] font-bold uppercase border border-indigo-500/30">Study Circle</span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-md text-[10px] font-bold uppercase">Normal Group</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Created by: <span className="text-slate-200">{group.Users?.[0]?.fullName || "Unknown"}</span></p>
                    </div>
                    
                    <button onClick={() => deleteGroup(group.id)} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 className="w-4 h-4" /> Delete Group
                    </button>
                  </div>
                ))}
                {groups.length === 0 && (
                  <p className="text-slate-500 text-center col-span-2 py-8">No groups available.</p>
                )}
              </div>
            </div>
          )}

          {/* CONTENT: AI CONTROL */}
          {activeTab === "ai" && (
            <div className="animate-fade-in text-center p-12">
              <BrainCircuit className="w-24 h-24 text-indigo-500/50 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">AI Control Center</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                The Gemini AI backend is currently automatically managed. Future updates will allow you to tweak AI prompts, change models dynamically, and pause AI activity directly from this panel.
              </p>
              <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 px-6 py-4 rounded-xl text-indigo-300 font-mono text-sm">
                Status: ONLINE | Model: gemini-flash-latest
              </div>
            </div>
          )}

        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default AdminDashboard;
