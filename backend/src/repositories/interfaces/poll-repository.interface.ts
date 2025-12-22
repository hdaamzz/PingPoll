import { IPoll } from '../../interfaces/poll.interface';
import { IBaseRepository } from '../../shared/interfaces/base-repository.interface';

export interface IPollRepository extends IBaseRepository<IPoll> {
  findByCreator(userId: string): Promise<IPoll[]>;
  findActivePolls(): Promise<IPoll[]>;
  findByIdWithCreator(pollId: string): Promise<IPoll | null>;
  updateVote(pollId: string, optionId: string, userId: string): Promise<IPoll | null>;
  removeVote(pollId: string, optionId: string, userId: string): Promise<IPoll | null>;
}
