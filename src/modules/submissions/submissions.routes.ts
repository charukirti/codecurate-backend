import { Router } from 'express';
import {
  requireAdmin,
  requireVerified,
  verifyToken,
} from '../auth/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  acceptSubmission,
  createSubmission,
  getAllSubmissions,
  getUserSubmissions,
} from './submissions.controller.js';
import {
  acceptSubmissionParamSchema,
  acceptSubmissionSchema,
  createSubmissionSchema,
} from './submissions.schema.js';

const router = Router();

router.post(
  '/',
  verifyToken,
  requireVerified,
  validate({ body: createSubmissionSchema }),
  createSubmission
);

router.get('/my-submissions', verifyToken, getUserSubmissions);

router.get('/', verifyToken, requireAdmin, getAllSubmissions);

router.patch(
  '/:submissionId/accept',
  verifyToken,
  requireAdmin,
  validate({
    body: acceptSubmissionSchema,
    params: acceptSubmissionParamSchema,
  }),
  acceptSubmission
);

export default router;
