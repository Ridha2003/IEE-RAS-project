import React, { useState, useEffect } from 'react';
    import { Users, BookOpen, Award, Clock } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import { db, Workshop, Member } from '../../lib/db';

    export default function AdminDashboard() {
      const [stats, setStats] = useState({
        memberCount: 0,
        workshopCount: 0,
        rewardCount: 0
      });
      const [currentWorkshops, setCurrentWorkshops] = useState<Workshop[]>([]);
      const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
      const [registeredMembers, setRegisteredMembers] = useState<Member[]>([]);
      const [attendance, setAttendance] = useState<{ [workshopId: string]: { [memberId: string]: boolean } }>({});
      const [isModalOpen, setIsModalOpen] = useState(false);

      useEffect(() => {
        loadStats();
        loadCurrentWorkshops();
      }, []);

      async function loadStats() {
        const [members, workshops, rewards] = await Promise.all([
          db.members.count(),
          db.workshops.count(),
          db.rewards.count()
        ]);

        setStats({
          memberCount: members,
          workshopCount: workshops,
          rewardCount: rewards
        });
      }

      async function loadCurrentWorkshops() {
        const now = new Date();
        const currentHour = now.getHours();

        const currentWorkshops = await db.workshops.filter(workshop => {
          const workshopHour = parseInt(workshop.time.split(':')[0]);
          return workshopHour === currentHour && new Date(workshop.date).toLocaleDateString() === now.toLocaleDateString() && !workshop.attendanceTaken;
        }).toArray();
        setCurrentWorkshops(currentWorkshops);
      }

      const handleWorkshopClick = async (workshop: Workshop) => {
        setSelectedWorkshop(workshop);
        const members = await db.members.filter(member => member.workshopsAttended?.includes(workshop.id)).toArray();
        setRegisteredMembers(members);

        // Load persisted attendance state
        const persistedAttendance = workshop.attendanceState || {};
        setAttendance(prev => ({
          ...prev,
          [workshop.id]: persistedAttendance
        }));

        setIsModalOpen(true);
      };

      const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorkshop(null);
        setRegisteredMembers([]);
      };

      const handleAttendanceChange = (memberId: string, present: boolean) => {
        if (!selectedWorkshop) return;
        setAttendance(prev => ({
          ...prev,
          [selectedWorkshop.id]: {
            ...prev[selectedWorkshop.id],
            [memberId]: present
          }
        }));
      };

      const handleBulkAttendance = async () => {
        if (!selectedWorkshop) return;

        const membersToUpdate = registeredMembers.map(member => ({
          member,
          present: attendance[selectedWorkshop.id]?.[member.id]
        }));

        // Implement bulk attendance logic here
        membersToUpdate.forEach(async ({member, present}) => {
          const updatedUser = {
            ...member,
            activities: [
              ...(member.activities || []),
              {
                id: Date.now().toString(),
                type: 'attendance_marked',
                description: `Attendance marked for workshop: ${selectedWorkshop.title} (${present ? 'Present' : 'Absent'})`,
                date: new Date().toISOString(),
                workshopId: selectedWorkshop.id
              }
            ]
          };
          await db.members.update(member.id, updatedUser);
        });

        // Update workshop to mark attendance as taken and persist attendance state
        await db.workshops.update(selectedWorkshop.id, { ...selectedWorkshop, attendanceTaken: true, attendanceState: attendance[selectedWorkshop.id] });

        // Remove workshop from current workshops after attendance is taken
        setCurrentWorkshops(prev => prev.filter(w => w.id !== selectedWorkshop.id));

        alert(`Attendance marked for ${registeredMembers.length} members for ${selectedWorkshop.title}`);
        handleCloseModal();
      };

      return (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Current Workshops</h2>
            <div className="space-y-4">
              {currentWorkshops.length > 0 ? (
                currentWorkshops.map((workshop) => (
                  <div key={workshop.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{workshop.title}</p>
                      <p className="text-sm text-gray-500">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {workshop.time}
                      </p>
                    </div>
                    <button
                      onClick={() => handleWorkshopClick(workshop)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      View Members
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No workshops in session right now.</div>
              )}
            </div>
          </div>

          {isModalOpen && selectedWorkshop && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  Registered Members for {selectedWorkshop.title}
                </h2>
                <ul className="space-y-2">
                  {registeredMembers.map((member) => (
                    <li key={member.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <span>{member.name}</span>
                      <div className="space-x-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-green-600"
                            name={`attendance-${member.id}`}
                            checked={attendance[selectedWorkshop.id]?.[member.id] === true}
                            onChange={() => handleAttendanceChange(member.id, true)}
                          />
                          <span className="ml-2 text-sm text-gray-700">Present</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-red-600"
                            name={`attendance-${member.id}`}
                            checked={attendance[selectedWorkshop.id]?.[member.id] === false}
                            onChange={() => handleAttendanceChange(member.id, false)}
                          />
                          <span className="ml-2 text-sm text-gray-700">Absent</span>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleBulkAttendance}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
