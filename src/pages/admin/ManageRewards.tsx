import React, { useState, useEffect } from 'react';
import { Gift, Plus, Edit2, Trash2 } from 'lucide-react';
import { db, Reward } from '../../lib/db';

export default function ManageRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [newReward, setNewReward] = useState<Partial<Reward>>({});

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    const allRewards = await db.rewards.toArray();
    setRewards(allRewards);
  }

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReward.name && newReward.pointsCost) {
      const reward: Reward = {
        id: Date.now().toString(),
        name: newReward.name,
        description: newReward.description || '',
        pointsCost: newReward.pointsCost,
        minLevel: newReward.minLevel || 1,
        quantity: newReward.quantity || 0,
      };

      await db.rewards.add(reward);
      await loadRewards();
      setIsAddingReward(false);
      setNewReward({});
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      await db.rewards.delete(id);
      await loadRewards();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Rewards</h1>
        <button
          onClick={() => setIsAddingReward(true)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Reward
        </button>
      </div>

      {isAddingReward && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Reward</h2>
          <form onSubmit={handleAddReward}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-md"
                  value={newReward.name || ''}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={newReward.description || ''}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Cost
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full p-2 border rounded-md"
                  value={newReward.pointsCost || ''}
                  onChange={(e) => setNewReward({ ...newReward, pointsCost: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Level
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5"
                  className="w-full p-2 border rounded-md"
                  value={newReward.minLevel || ''}
                  onChange={(e) => setNewReward({ ...newReward, minLevel: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Available
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full p-2 border rounded-md"
                  value={newReward.quantity || ''}
                  onChange={(e) => setNewReward({ ...newReward, quantity: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsAddingReward(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Reward
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Gift className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{reward.name}</h2>
                  <p className="mt-1 text-gray-600">{reward.description}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">Points Required: {reward.pointsCost}</p>
                    <p className="text-sm text-gray-500">Minimum Level: {reward.minLevel}</p>
                    <p className="text-sm text-gray-500">Available: {reward.quantity}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeleteReward(reward.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
