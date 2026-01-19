import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import reviewRoutes from '../reviews/reviews.routes';

import {
  createResourceSchema,
  getResourceParamSchema,
  getResourcesQuerySchema,
} from './resource.schema';
import {
  createResource,
  deleteResource,
  getAllResources,
  getResource,
} from './resource.controller';
import { requireAdmin, verifyToken } from '../auth/auth.middleware';

const router = Router();

router.post(
  '/',
  verifyToken,
  requireAdmin,
  validate({ body: createResourceSchema }),
  createResource
);
router.get('/', validate({ query: getResourcesQuerySchema }), getAllResources);
router.get(
  '/:id',
  verifyToken,
  validate({ params: getResourceParamSchema }),
  getResource
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
