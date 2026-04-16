import { Router } from 'express';
import { requireAdmin, verifyToken } from '../auth/auth.middleware.js';
import {
  acceptSubmission,
  getAllSubmissions,
  rejectSubmission,
} from '../submissions/submissions.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  acceptSubmissionParamSchema,
  acceptSubmissionSchema,
  rejectSubmissionSchema,
} from '../submissions/submissions.schema.js';
import {
  createResourceSchema,
  getResourceParamSchema,
} from '../resource/resource.schema.js';
import {
  createResource,
  deleteResource,
} from '../resource/resource.controller.js';

const router = Router();

router.use(verifyToken, requireAdmin);

/* submission module admin routes */

router.get('/submissions', getAllSubmissions);

router.patch(
  '/submissions/:submissionId/accept',
  validate({
    body: acceptSubmissionSchema,
    params: acceptSubmissionParamSchema,
  }),
  acceptSubmission
);

router.patch(
  '/submissions/:submissionId/reject',
  validate({
    params: acceptSubmissionParamSchema,
    body: rejectSubmissionSchema,
  }),
  rejectSubmission
);

/* resource module admin routes */

router.post(
  '/resources',
  validate({ body: createResourceSchema }),
  createResource
);

router.delete(
  '/resources/:id',
  validate({ params: getResourceParamSchema }),
  deleteResource
);

export default router;
