export interface Database {
  members: {
    id: string;
    name: string;
    email: string;
    points: number;
    level: number;
    created_at: string;
    updated_at: string;
  };
  workshops: {
    id: string;
    name: string;
    description: string | null;
    points: number;
    min_level: number;
    date: string;
    created_at: string;
  };
  attendances: {
    id: string;
    member_id: string;
    workshop_id: string;
    created_at: string;
  };
}
