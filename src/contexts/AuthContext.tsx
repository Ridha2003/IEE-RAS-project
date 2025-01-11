import React, { createContext, useContext, useState, useEffect } from 'react';
    import { db, Member } from '../lib/db';

    interface AuthContextType {
      user: Member | null;
      loading: boolean;
      signIn: (email: string, password: string) => Promise<void>;
      signOut: () => Promise<void>;
      setUser: (user: Member) => void;
    }

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    export function AuthProvider({ children }: { children: React.ReactNode }) {
      const [user, setUser] = useState<Member | null>(null);
      const [loading, setLoading] = useState(true);

      // Check for existing session
      useEffect(() => {
        const checkSession = async () => {
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            const member = await db.members.get(storedUserId);
            if (member) {
              setUser(member);
            }
          }
          setLoading(false);
        };
        checkSession();
      }, []);

      const signIn = async (email: string, _password: string) => {
        setLoading(true);
        try {
          const member = await db.members.where('email').equals(email).first();
          if (member) {
            setUser(member);
            localStorage.setItem('userId', member.id);
          } else {
            throw new Error('Invalid credentials');
          }
        } finally {
          setLoading(false);
        }
      };

      const signOut = async () => {
        localStorage.removeItem('userId');
        setUser(null);
      };

      const updateUser = (updatedUser: Member) => {
        setUser(updatedUser);
      };

      if (loading) {
        return <div>Loading...</div>;
      }

      return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, setUser: updateUser }}>
          {children}
        </AuthContext.Provider>
      );
    }

    export function useAuth() {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    }
