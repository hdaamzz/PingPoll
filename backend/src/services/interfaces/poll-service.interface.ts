import { CreatePollDto } from '../../shared/dtos/poll/create-poll.dto';
import { UpdatePollDto } from '../../shared/dtos/poll/update-poll.dto';
import { PollDto } from '../../shared/dtos/poll/poll.dto';

export interface IPollService {
  createPoll(userId: string, createPollDto: CreatePollDto): Promise<PollDto>;
  getUserPolls(userId: string): Promise<PollDto[]>;
  getPollById(pollId: string): Promise<PollDto>;
  updatePoll(pollId: string, userId: string, updatePollDto: UpdatePollDto): Promise<PollDto>;
  deletePoll(pollId: string, userId: string): Promise<void>;
  voteOnPoll(pollId: string, optionId: string, userId: string): Promise<PollDto>;
  getActivePolls(): Promise<PollDto[]>;
}
