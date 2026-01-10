export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  title: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  status: 'active' | 'closed' | 'draft';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface CreatePollRequest {
  title: string;
  question: string;
  options: { id: string; text: string }[];
  expiresAt?: Date;
}

export interface UpdatePollRequest {
  title?: string;
  question?: string;
  status?: 'active' | 'closed';
  expiresAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
