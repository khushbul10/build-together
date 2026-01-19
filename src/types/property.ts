interface ProjectUser {
  id: string;
  name: string | null;
}

// Defines a member, which includes when they joined
interface ProjectMember extends ProjectUser {
  joined_at: Date;
}

// The main Property/Project type
export interface Property {
  _id: string; // Will be a string after serialization
  title: string;
  description: string;
  location: string;
  images: string[];
  
  created_at: Date;
  created_by: ProjectUser;
  
  admins: ProjectUser[];
  members: ProjectMember[];
  
  expected_members: number;
  per_member_cost: number;
  target_amount: number; // This is (expected_members * per_member_cost)
  
  status: "FUNDING" | "ACTIVE" | "COMPLETED";

  chat_messages: {
    user: string;
    message: string;
    timestamp: Date;
  }[];
}