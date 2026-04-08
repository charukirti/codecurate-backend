import { Router } from 'express';
import { requireVerified, verifyToken } from '../auth/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  createSubmission,
  getUserSubmissions,
} from './submissions.controller.js';
import { createSubmissionSchema } from './submissions.schema.js';

const router = Router();

router.post(
  '/',
  verifyToken,
  requireVerified,
  validate({ body: createSubmissionSchema }),
  createSubmission
);

router.get('/my-submissions', verifyToken, getUserSubmissions);

export default router;
