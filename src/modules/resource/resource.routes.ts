import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import reviewRoutes from '../reviews/reviews.routes.js';

import {
  createResourceSchema,
  getResourceParamSchema,
} from './resource.schema.js';
import {
  createResource,
  deleteResource,
  getAllResources,
  getRelatedResources,
  getResource,
} from './resource.controller.js';
import { requireAdmin, verifyToken } from '../auth/auth.middleware.js';

const router = Router();

router.post(
  '/',
  verifyToken,
  requireAdmin,
  validate({ body: createResourceSchema }),
  createResource
);
router.get('/', getAllResources);
router.get('/:id', validate({ params: getResourceParamSchema }), getResource);
router.get(
  '/:id/related',
  validate({ params: getResourceParamSchema }),
  getRelatedResources
);
router.delete(
  '/:id',
  verifyToken,
  requireAdmin,
  validate({ params: getResourceParamSchema }),
  deleteResource
);

router.use('/:resourceId/reviews', reviewRoutes);
export default router;
