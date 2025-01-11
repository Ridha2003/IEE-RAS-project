import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, BookOpen, LayoutDashboard, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === 'demo@example.com';

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-xl">Club Manager</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            {user && !isAdmin && (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/workshops" className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600">
                  <BookOpen className="h-5 w-5" />
                  <span>Workshops</span>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600">
                <Settings className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={() => signOut()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/signin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
