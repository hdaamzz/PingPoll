import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { IPollService } from '../services/interfaces/poll-service.interface';
import { IPollController } from './interfaces/poll-controller.interface';
import { AuthRequest } from '../middlewares/interfaces/auth-middleware.interface';
import { HTTP_STATUS } from '../constants/http-status.constants';
import { POLL_MESSAGES } from '../constants/messages.constants';
import { CreatePollDto } from '../shared/dtos/poll/create-poll.dto';
import { UpdatePollDto } from '../shared/dtos/poll/update-poll.dto';

@injectable()
export class PollController implements IPollController {
  constructor(
    @inject('IPollService') private pollService: IPollService
  ) {}

  createPoll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: POLL_MESSAGES.POLL_UNAUTHORIZED
        });
        return;
      }

      const createPollDto = new CreatePollDto(req.body);
      const poll = await this.pollService.createPoll(userId, createPollDto);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: POLL_MESSAGES.POLL_CREATED,
        data: poll.toJSON()
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || POLL_MESSAGES.POLL_CREATE_FAILED
      });
    }
  };

  getUserPolls = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: POLL_MESSAGES.POLL_UNAUTHORIZED
        });
        return;
      }

      const polls = await this.pollService.getUserPolls(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { polls: polls.map(p => p.toJSON()) }
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || POLL_MESSAGES.POLL_FETCH_FAILED
      });
    }
  };

  getPollById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pollId } = req.params;
      const poll = await this.pollService.getPollById(pollId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: poll.toJSON()
      });
    } catch (error: any) {
      const status = error.message === POLL_MESSAGES.POLL_NOT_FOUND 
        ? HTTP_STATUS.NOT_FOUND 
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(status).json({
        success: false,
        message: error.message || POLL_MESSAGES.POLL_FETCH_FAILED
      });
    }
  };

  updatePoll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const { pollId } = req.params;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: POLL_MESSAGES.POLL_UNAUTHORIZED
        });
        return;
      }

      const updatePollDto = new UpdatePollDto(req.body);
      const poll = await this.pollService.updatePoll(pollId, userId, updatePollDto);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: POLL_MESSAGES.POLL_UPDATED,
        data: poll.toJSON()
      });
    } catch (error: any) {
      const status = error.message === POLL_MESSAGES.POLL_UNAUTHORIZED 
        ? HTTP_STATUS.FORBIDDEN 
        : HTTP_STATUS.BAD_REQUEST;

      res.status(status).json({
        success: false,
        message: error.message || POLL_MESSAGES.POLL_UPDATE_FAILED
      });
    }
  };

  deletePoll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const { pollId } = req.params;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: POLL_MESSAGES.POLL_UNAUTHORIZED
        });
        return;
      }

      await this.pollService.deletePoll(pollId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: POLL_MESSAGES.POLL_DELETED
      });
    } catch (error: any) {
      const status = error.message === POLL_MESSAGES.POLL_UNAUTHORIZED 
        ? HTTP_STATUS.FORBIDDEN 
        : HTTP_STATUS.BAD_REQUEST;

      res.status(status).json({
        success: false,
        message: error.message || POLL_MESSAGES.POLL_DELETE_FAILED
      });
    }
  };

  voteOnPoll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const { pollId, optionId } = req.params;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: POLL_MESSAGES.POLL_UNAUTHORIZED
        });
        return;
      }

      const poll = await this.pollService.voteOnPoll(pollId, optionId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: POLL_MESSAGES.POLL_VOTE_SUCCESS,
        data: poll.toJSON()
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || POLL_MESSAGES.POLL_VOTE_FAILED
      });
    }
  };

  getActivePolls = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const polls = await this.pollService.getActivePolls();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { polls: polls.map(p => p.toJSON()) }
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || POLL_MESSAGES.POLL_FETCH_FAILED
      });
    }
  };
}
