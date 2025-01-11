import React, { useState, useEffect } from 'react';
    import { Calendar, Clock, MapPin } from 'lucide-react';
    import { db, Workshop } from '../../lib/db';
    import { useAuth } from '../../contexts/AuthContext';

    export default function MemberWorkshops() {
      const [workshops, setWorkshops] = useState<Workshop[]>([]);
      const { user, setUser } = useAuth();

      useEffect(() => {
        loadWorkshops();
      }, []);

      async function loadWorkshops() {
        const allWorkshops = await db.workshops.toArray();
        // Sort workshops by date in descending order (newest first)
        const sortedWorkshops = allWorkshops.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).reverse();
        setWorkshops(sortedWorkshops);
      }

      const handleRegister = async (workshop: Workshop) => {
        if (!user) {
          alert('Please sign in to register for workshops');
          return;
        }

        if (user.level < workshop.minLevel) {
          alert(`You need to be level ${workshop.minLevel} or higher to join this workshop`);
          return;
        }

        if (user.workshopsAttended?.includes(workshop.id)) {
          alert('You are already registered for this workshop');
          return;
        }

        // Add new activity for workshop registration
        const newActivity = {
          id: Date.now().toString(),
          type: 'workshop_registration',
          description: `Registered for workshop: ${workshop.title}`,
          date: new Date().toISOString(),
          workshopId: workshop.id
        };

        // Update user with new workshop registration and activity
        const updatedUser = {
          ...user,
          workshopsAttended: [...(user.workshopsAttended || []), workshop.id],
          // Keep only the last 3 activities by adding the new one at the beginning
          activities: [
            newActivity,
            ...(user.activities || []).slice(0, 2)
          ]
        };

        await db.members.update(user.id, updatedUser);
        setUser(updatedUser);
        alert('Successfully registered for the workshop! Points will be awarded after attendance is confirmed.');
      };

      return (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Available Workshops</h1>
            <p className="mt-2 text-gray-600">Join workshops to earn points and level up your skills</p>
          </div>

          {workshops.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No workshops available at the moment. Check back later!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {workshops.map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{workshop.title}</h2>
                      <p className="mt-2 text-gray-600">{workshop.description}</p>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-5 w-5 mr-2" />
                          <span>{new Date(workshop.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-5 w-5 mr-2" />
                          <span>{workshop.time}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-5 w-5 mr-2" />
                          <span>{workshop.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {workshop.points} points on completion
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Min Level: {workshop.minLevel}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => handleRegister(workshop)}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                      disabled={!user || user.level < workshop.minLevel || user.workshopsAttended?.includes(workshop.id)}
                    >
                      {!user ? 'Sign in to Register' :
                        user.level < workshop.minLevel ? `Requires Level ${workshop.minLevel}` :
                          user.workshopsAttended?.includes(workshop.id) ? 'Already Registered' :
                            'Register for Workshop'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
