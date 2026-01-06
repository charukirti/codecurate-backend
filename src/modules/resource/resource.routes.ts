import { Router } from 'express';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../middlewares/validate';
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
  validate(createResourceSchema),
  createResource
);
router.get('/', validateQuery(getResourcesQuerySchema), getAllResources);
router.get(
  '/:id',
  verifyToken,
  validateParams(getResourceParamSchema),
  getResource
);
router.get(
  '/:id',
  verifyToken,
  requireAdmin,
  validateParams(getResourceParamSchema),
  deleteResource
);
export default router;
