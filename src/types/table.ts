export interface Table {
  id: string;
  name: string;
  created_at: string | null;
  created_by: string;
  updated_at: string | null;
}

export interface TableCardProps {
  table: Table;
  onDelete: (id: string) => void;
}