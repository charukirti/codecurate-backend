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
  getAllResources,
  getResource,
} from './resource.controller';

const router = Router();

router.post('/', validate(createResourceSchema), createResource);
router.get('/', validateQuery(getResourcesQuerySchema), getAllResources);
router.get('/:id', validateParams(getResourceParamSchema), getResource);
export default router;
