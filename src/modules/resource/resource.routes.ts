import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { createResourceSchema } from './resource.schema';
import { getVideoData } from './resource.controller';

const router = Router();

router.post('/', validate(createResourceSchema), getVideoData);
export default router;
