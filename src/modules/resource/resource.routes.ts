import { Router } from 'express';
import { validate, validateQuery } from '../../middlewares/validate';
import {
  createResourceSchema,
  getResourcesQuerySchema,
} from './resource.schema';
import { createResource, getAllResources } from './resource.controller';

const router = Router();

router.post('/', validate(createResourceSchema), createResource);
router.get('/', validateQuery(getResourcesQuerySchema), getAllResources);
export default router;
