import React, { useState, useEffect } from 'react';
    import { useAuth } from '../../contexts/AuthContext';
    import { Award, Calendar, Star } from 'lucide-react';
    import { db, Workshop, Activity } from '../../lib/db';

    export default function MemberDashboard() {
      const { user } = useAuth();
      const [activities, setActivities] = useState<Activity[]>([]);
      const [workshopCount, setWorkshopCount] = useState(0);

      useEffect(() => {
        if (user) {
          loadActivities();
        }
      }, [user]);

      async function loadActivities() {
        if (user?.activities) {
          // Sort activities by date in descending order (newest first)
          // and take only the last 3 activities
          const sortedActivities = [...user.activities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
          setActivities(sortedActivities);
          setWorkshopCount(user.workshopsAttended?.length || 0);
        }
      }

      if (!user) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h2>
          </div>
        );
      }

      return (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
            <p className="mt-2 text-gray-600">Track your progress and upcoming workshops</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold">Points</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{user.points}</p>
              <p className="text-sm text-gray-500 mt-1">Total points earned</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-indigo-500 mr-2" />
                <h3 className="text-lg font-semibold">Level</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{user.level}</p>
              <p className="text-sm text-gray-500 mt-1">Current member level</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold">Workshops</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{workshopCount}</p>
              <p className="text-sm text-gray-500 mt-1">Workshops registered</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {activity.type === 'workshop_registration' ? 'Workshop Registration' : 'Activity'}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No activities yet. Join workshops to get started!</p>
              )}
            </div>
          </div>
        </div>
      );
    }
