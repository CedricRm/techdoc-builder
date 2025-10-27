export type Project = {
  id: string;
  name: string;
  client: string | null;
  date?: string | null;
};

export type Equipment = {
  id: string;
  project_id: string;
  type: string;
  room: string;
  model: string;
  qty: number;
  created_at?: string;
};

export type Point = {
  id: string;
  project_id: string;
  equipment_id: string;
  point_key: string;
};
