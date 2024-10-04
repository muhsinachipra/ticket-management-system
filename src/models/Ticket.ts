export interface Ticket {
  id: number;
  title: string;
  description: string;
  type: "concert" | "conference" | "sports";
  venue: string;
  status: "open" | "in-progress" | "closed";
  price: number;
  priority: "low" | "medium" | "high";
  dueDate: Date;
  createdBy: number;
  assignedUsers: string[];
}
