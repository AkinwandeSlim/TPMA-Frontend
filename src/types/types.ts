export interface Notification {
  id: string;
  message: string;
  type: string;
  priority: string;
  read_status: boolean;
  created_at: string;
  user_id: string;
}