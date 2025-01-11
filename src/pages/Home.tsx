import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to Club Management
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Track your progress, join workshops, and level up your skills
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Member Management</h3>
              <p className="mt-2 text-base text-gray-500">
                Track member progress and participation in club activities
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <Target className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Workshop Tracking</h3>
              <p className="mt-2 text-base text-gray-500">
                Join workshops and earn points for your participation
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Rewards System</h3>
              <p className="mt-2 text-base text-gray-500">
                Unlock rewards and advance through membership levels
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
