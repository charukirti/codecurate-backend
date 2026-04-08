import { Request, Response, NextFunction } from 'express';
import { CreateSubmissionInput } from './submissions.schema.js';
import { submissionsService } from './submissions.service.js';

export async function createSubmission(
  req: Request<{}, {}, CreateSubmissionInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const submission = await submissionsService.createSubmissions(
      userId,
      req.body
    );

    res.status(201).json({
      message: 'Submission created successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}
