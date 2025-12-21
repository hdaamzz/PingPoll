import { IPoll } from "../../../models/poll.model";

export interface PollOptionDto {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export class PollDto {
  id: string;
  title: string;
  question: string;
  options: PollOptionDto[];
  totalVotes: number;
  status: 'active' | 'closed' | 'draft';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;

  constructor(poll: IPoll) {
    this.id = poll._id.toString();
    this.title = poll.title;
    this.question = poll.question;
    this.totalVotes = poll.totalVotes;
    this.status = poll.status;
    this.createdBy = poll.createdBy.toString();
    this.createdAt = poll.createdAt;
    this.updatedAt = poll.updatedAt;
    this.expiresAt = poll.expiresAt;
    
    this.options = poll.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes,
      percentage: this.calculatePercentage(opt.votes, poll.totalVotes)
    }));
  }

  private calculatePercentage(votes: number, total: number): number {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  }

  static fromModel(poll: IPoll): PollDto {
    return new PollDto(poll);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      question: this.question,
      options: this.options,
      totalVotes: this.totalVotes,
      status: this.status,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt
    };
  }
}
