import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateAvatar, getUserProfile, updateProfile } from '../controllers/userController.js';
import {
  sendRequest,
  getRequests,
  respondToRequest,getFriends
} from '../controllers/friendController.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/avatar', protect, updateAvatar);
router.put('/profil', protect, updateProfile);
router.post('/friends/request', protect, sendRequest);
router.get('/friends/requests', protect, getRequests);
router.put('/friends/request/:requestId', protect, respondToRequest);
router.get('/friends', protect, getFriends);

export default router;
