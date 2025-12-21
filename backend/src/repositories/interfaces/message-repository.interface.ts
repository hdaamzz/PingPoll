import { IMessage } from "../../models/message.model";
import { IBaseRepository } from "../../shared/interfaces/base-repository.interface";


export interface IMessageRepository extends IBaseRepository<IMessage> {
  findByPollId(pollId: string, limit?: number): Promise<IMessage[]>;
  deleteByPollId(pollId: string): Promise<void>;
  countByPollId(pollId: string): Promise<number>;
}
