import { Request, Response, NextFunction } from 'express';
import {
  createResourceInput,
  getResourceByIdParam,
  getResourcesQuerySchema,
} from './resource.schema.js';
import { resourceService } from './resource.service.js';
import { ValidationError } from '../../shared/errors.js';

export async function createResource(
  req: Request<{}, {}, createResourceInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const savedResource = await resourceService.extractFromUrl(req.body);

    res.status(201).json({
      message: 'Resource processed and created successfully',
      data: savedResource,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllResources(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      search,
      codeLang,
      topic,
      type,
      page = 1,
      limit = 10,
    } = getResourcesQuerySchema.parse(req.query);

    const { data, pagination } = await resourceService.getResources({
      search,
      codeLang,
      topic,
      type,
      page,
      limit,
    });

    res.status(200).json({
      message: 'Fetched all resources successfully',
      data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError('Invalid ID params', id);
    }

    const resource = await resourceService.getResourceById(id);

    res.status(200).json({
      message: 'Fetched resource successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRelatedResources(
  req: Request<getResourceByIdParam>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const relatedResources = await resourceService.getRelatedResources(id);

    res.status(200).json({
      message: 'Fetched related resources successfully',
      data: relatedResources,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    await resourceService.deleteResourceById(id!);

    res.status(200).json({
      message: 'resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
