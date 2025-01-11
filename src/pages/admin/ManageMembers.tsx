import React, { useState, useEffect } from 'react';
    import { Search, Edit2, Trash2, Award, Plus, Check } from 'lucide-react';
    import { db, Member, Workshop } from '../../lib/db';

    export default function ManageMembers() {
      const [members, setMembers] = useState<Member[]>([]);
      const [workshops, setWorkshops] = useState<Workshop[]>([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [isEditing, setIsEditing] = useState(false);
      const [currentMember, setCurrentMember] = useState<Partial<Member>>({});
      const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');

      useEffect(() => {
        loadMembers();
        loadWorkshops();
      }, []);

      async function loadMembers() {
        const allMembers = await db.members.toArray();
        setMembers(allMembers);
      }

      async function loadWorkshops() {
        const allWorkshops = await db.workshops.toArray();
        setWorkshops(allWorkshops);
      }

      const filteredMembers = members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (currentMember.name && currentMember.email) {
          if (currentMember.id) {
            // Update existing member
            await db.members.update(currentMember.id, {
              ...currentMember as Member
            });
          } else {
            // Add new member
            const newMember: Member = {
              id: Date.now().toString(),
              name: currentMember.name,
              email: currentMember.email,
              points: 0,
              level: 1,
              joinDate: new Date().toISOString().split('T')[0],
              workshopsAttended: [],
              activities: []
            };
            await db.members.add(newMember);
          }
          setIsEditing(false);
          setCurrentMember({});
          loadMembers();
        }
      }

      async function handleDelete(id: string) {
        if (confirm('Are you sure you want to delete this member?')) {
          await db.members.delete(id);
          loadMembers();
        }
      }

      async function awardPoints(member: Member, workshop: Workshop) {
        if (!workshop) return;

        const updatedUser = {
          ...member,
          points: member.points + workshop.points,
          activities: [
            ...(member.activities || []),
            {
              id: Date.now().toString(),
              type: 'points_awarded',
              description: `Completed workshop: ${workshop.title} (+${workshop.points} points)`,
              date: new Date().toISOString(),
              workshopId: workshop.id
            }
          ]
        };

        // Update level based on new points
        if (updatedUser.points >= 1000) updatedUser.level = 5;
        else if (updatedUser.points >= 500) updatedUser.level = 4;
        else if (updatedUser.points >= 250) updatedUser.level = 3;
        else if (updatedUser.points >= 100) updatedUser.level = 2;

        await db.members.update(member.id, updatedUser);
        loadMembers();
        alert(`Points awarded to ${member.name} for completing ${workshop.title}`);
      }

      return (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Manage Members</h1>
              <button
                onClick={() => {
                  setCurrentMember({});
                  setIsEditing(true);
                }}
                className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Member
              </button>
            </div>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Search members..."
                className="w-full p-3 pl-10 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {isEditing && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {currentMember.id ? 'Edit Member' : 'Add New Member'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded-md"
                        value={currentMember.name || ''}
                        onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full p-2 border rounded-md"
                        value={currentMember.email || ''}
                        onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setCurrentMember({});
                      }}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      {currentMember.id ? 'Update' : 'Add'} Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered Workshops
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Award Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-indigo-600 mr-2" />
                        <span className="text-sm text-gray-900">Level {member.level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.points} points</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.workshopsAttended?.length > 0 ? (
                          member.workshopsAttended.map(workshopId => {
                            const workshop = workshops.find(w => w.id === workshopId);
                            return workshop ? <span key={workshopId} className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-md mr-1 mb-1 text-xs">{workshop.title}</span> : null;
                          })
                        ) : (
                          <span>No workshops</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          className="p-2 border rounded-md text-sm"
                          onChange={(e) => setSelectedWorkshop(e.target.value)}
                          value={selectedWorkshop}
                        >
                          <option value="">Select Workshop</option>
                          {workshops.map((workshop) => (
                            <option key={workshop.id} value={workshop.id}>
                              {workshop.title}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const workshop = workshops.find(w => w.id === selectedWorkshop);
                            if (workshop) {
                              awardPoints(member, workshop);
                            }
                          }}
                          className="p-2 text-green-600 hover:text-green-900"
                          disabled={!selectedWorkshop}
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
