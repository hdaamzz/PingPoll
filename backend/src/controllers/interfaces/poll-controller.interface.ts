import { Response } from 'express';
import { AuthRequest } from '../../middlewares/interfaces/auth-middleware.interface';

export interface IPollController {
  createPoll(req: AuthRequest, res: Response): Promise<void>;
  getUserPolls(req: AuthRequest, res: Response): Promise<void>;
  getPollById(req: AuthRequest, res: Response): Promise<void>;
  updatePoll(req: AuthRequest, res: Response): Promise<void>;
  deletePoll(req: AuthRequest, res: Response): Promise<void>;
  voteOnPoll(req: AuthRequest, res: Response): Promise<void>;
  getActivePolls(req: AuthRequest, res: Response): Promise<void>;
}
