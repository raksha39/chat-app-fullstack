import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { getUsers, getMessages ,markMessagesSeen, sendMessage} from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsers);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMessagesSeen);
messageRouter.post("/send/:id",protectRoute,sendMessage)

export default messageRouter;