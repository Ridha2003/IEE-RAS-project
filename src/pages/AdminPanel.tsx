import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    memberCount: 0,
    workshopCount: 0,
    rewardCount: 0
  });

  useEffect(() => {
    async function loadStats() {
      const [members, workshops] = await Promise.all([
        db.members.count(),
        db.workshops.count()
      ]);

      setStats({
        memberCount: members,
        workshopCount: workshops,
        rewardCount: 0 // We'll implement rewards later
      });
    }

    loadStats();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">Please sign in with an admin account to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-gray-600">Manage members, workshops, and system settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/members" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">Members</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.memberCount}</p>
            <p className="text-sm text-gray-500 mt-1">Total active members</p>
            <div className="mt-4 text-blue-600">Manage Members →</div>
          </div>
        </Link>

        <Link to="/admin/workshops" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Workshops</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.workshopCount}</p>
            <p className="text-sm text-gray-500 mt-1">Active workshops</p>
            <div className="mt-4 text-green-600">Manage Workshops →</div>
          </div>
        </Link>

        <Link to="/admin/rewards" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold">Rewards</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.rewardCount}</p>
            <p className="text-sm text-gray-500 mt-1">Available rewards</p>
            <div className="mt-4 text-purple-600">Manage Rewards →</div>
          </div>
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.memberCount > 0 ? (
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">System Status</p>
                  <p className="text-sm text-gray-500">Database initialized with members</p>
                </div>
                <span className="text-sm text-gray-500">Active</span>
              </div>
            ) : (
              <div className="text-gray-500">No recent activity</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">System Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Status</span>
              <span className="text-gray-900">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
