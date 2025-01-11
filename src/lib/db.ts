import Dexie, { Table } from 'dexie';

    export interface Member {
      id: string;
      name: string;
      email: string;
      points: number;
      level: number;
      joinDate: string;
      workshopsAttended: string[]; // Array of workshop IDs
      activities: Activity[]; // Add activities array
    }

    export interface Workshop {
      id: string;
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      points: number;
      minLevel: number;
      attendanceState?: { [memberId: string]: boolean };
      attendanceTaken?: boolean;
    }

    export interface Reward {
      id: string;
      name: string;
      description: string;
      pointsCost: number;
      minLevel: number;
      quantity: number;
    }

    export interface Activity {
      id: string;
      type: string;
      description: string;
      date: string;
      workshopId?: string;
    }

    export class ClubDB extends Dexie {
      members!: Table<Member>;
      workshops!: Table<Workshop>;
      rewards!: Table<Reward>;

      constructor() {
        super('clubDB');
        this.version(1).stores({
          members: 'id, email, name, points, level, joinDate',
          workshops: 'id, title, date, minLevel',
          rewards: 'id, name, pointsCost, minLevel'
        });
      }
    }

    export const db = new ClubDB();

    // Add demo user with initial values
    const initDB = async () => {
      const memberCount = await db.members.count();
      if (memberCount === 0) {
        await db.members.add({
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          points: 0,
          level: 1,
          joinDate: new Date().toISOString().split('T')[0],
          workshopsAttended: [],
          activities: []
        });
      }
    };

    initDB();
