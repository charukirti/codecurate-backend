import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import reviewRoutes from '../reviews/reviews.routes.js';

import { getResourceParamSchema } from './resource.schema.js';
import {
  getAllResources,
  getRelatedResources,
  getResource,
} from './resource.controller.js';

const router = Router();

router.get('/', getAllResources);
router.get('/:id', validate({ params: getResourceParamSchema }), getResource);
router.get(
  '/:id/related',
  validate({ params: getResourceParamSchema }),
  getRelatedResources
);

router.use('/:resourceId/reviews', reviewRoutes);
export default router;
