import { injectable, inject } from 'tsyringe';
import { IPollRepository } from '../repositories/interfaces/poll-repository.interface';
import { IPollService } from './interfaces/poll-service.interface';
import { CreatePollDto } from '../shared/dtos/poll/create-poll.dto';
import { UpdatePollDto } from '../shared/dtos/poll/update-poll.dto';
import { PollDto } from '../shared/dtos/poll/poll.dto';
import { POLL_MESSAGES } from '../constants/messages.constants';

@injectable()
export class PollService implements IPollService {
  constructor(
    @inject('IPollRepository') private pollRepository: IPollRepository
  ) {}

  async createPoll(userId: string, createPollDto: CreatePollDto): Promise<PollDto> {
    const pollData = {
      title: createPollDto.title,
      question: createPollDto.question,
      options: createPollDto.options.map(opt => ({
        ...opt,
        votes: 0,
        votedBy: []
      })),
      createdBy: userId,
      status: 'active' as const,
      totalVotes: 0,
      expiresAt: createPollDto.expiresAt
    };

    const poll = await this.pollRepository.create(pollData as any);
    return PollDto.fromModel(poll);
  }

  async getUserPolls(userId: string): Promise<PollDto[]> {
    const polls = await this.pollRepository.findByCreator(userId);
    return polls.map(poll => PollDto.fromModel(poll));
  }

  async getPollById(pollId: string): Promise<PollDto> {
    const poll = await this.pollRepository.findByIdWithCreator(pollId);
    
    if (!poll) {
      throw new Error(POLL_MESSAGES.POLL_NOT_FOUND);
    }

    return PollDto.fromModel(poll);
  }

  async updatePoll(pollId: string, userId: string, updatePollDto: UpdatePollDto): Promise<PollDto> {
    const poll = await this.pollRepository.findById(pollId);

    if (!poll) {
      throw new Error(POLL_MESSAGES.POLL_NOT_FOUND);
    }

    if (poll.createdBy.toString() !== userId) {
      throw new Error(POLL_MESSAGES.POLL_UNAUTHORIZED);
    }

    const updatedPoll = await this.pollRepository.update(pollId, updatePollDto as any);
    
    if (!updatedPoll) {
      throw new Error(POLL_MESSAGES.POLL_UPDATE_FAILED);
    }

    return PollDto.fromModel(updatedPoll);
  }

  async deletePoll(pollId: string, userId: string): Promise<void> {
    const poll = await this.pollRepository.findById(pollId);

    if (!poll) {
      throw new Error(POLL_MESSAGES.POLL_NOT_FOUND);
    }

    if (poll.createdBy.toString() !== userId) {
      throw new Error(POLL_MESSAGES.POLL_UNAUTHORIZED);
    }

    await this.pollRepository.delete(pollId);
  }

  async voteOnPoll(pollId: string, optionId: string, userId: string): Promise<PollDto> {
    const poll = await this.pollRepository.findById(pollId);

    if (!poll) {
      throw new Error(POLL_MESSAGES.POLL_NOT_FOUND);
    }

    if (poll.status !== 'active') {
      throw new Error(POLL_MESSAGES.POLL_NOT_ACTIVE);
    }

    if (poll.expiresAt && poll.expiresAt < new Date()) {
      await this.pollRepository.update(pollId, { status: 'closed' } as any);
      throw new Error(POLL_MESSAGES.POLL_EXPIRED);
    }

    const updatedPoll = await this.pollRepository.updateVote(pollId, optionId, userId);

    if (!updatedPoll) {
      throw new Error(POLL_MESSAGES.POLL_VOTE_FAILED);
    }

    return PollDto.fromModel(updatedPoll);
  }

  async getActivePolls(): Promise<PollDto[]> {
    const polls = await this.pollRepository.findActivePolls();
    return polls.map(poll => PollDto.fromModel(poll));
  }
}
