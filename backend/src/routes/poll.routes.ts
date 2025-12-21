import { Router } from 'express';
import { container } from 'tsyringe';
import { PollController } from '../controllers/poll.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const pollController = container.resolve(PollController);
const authMiddleware = container.resolve(AuthMiddleware);


router.post('/', authMiddleware.authenticate, pollController.createPoll);
router.get('/my-polls', authMiddleware.authenticate, pollController.getUserPolls);
router.get('/active', pollController.getActivePolls); 
router.get('/:pollId', pollController.getPollById); 
router.put('/:pollId', authMiddleware.authenticate, pollController.updatePoll);
router.delete('/:pollId', authMiddleware.authenticate, pollController.deletePoll);
router.post('/:pollId/vote/:optionId', authMiddleware.authenticate, pollController.voteOnPoll);

export default router;
