import { Request, Response, NextFunction } from 'express';
import {
  AcceptSubmissionInput,
  AcceptSubmissionParamsInput,
  CreateSubmissionInput,
  getAllSubmissionsQuerySchema,
  RejectSubmissionInput,
} from './submissions.schema.js';
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

export async function getUserSubmissions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const submissions = await submissionsService.getSubmissionsByUserId(userId);

    res.status(200).json({
      message: 'User submissions retrieved successfully',
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllSubmissions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, page, limit } = getAllSubmissionsQuerySchema.parse(
      req.query
    );
    const submissions = await submissionsService.getAllSubmissions({
      status,
      page,
      limit,
    });

    res.status(200).json({
      message: 'All submissions retrieved successfully',
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
}

export async function acceptSubmission(
  req: Request<AcceptSubmissionParamsInput, {}, AcceptSubmissionInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.userId!;
    const { submissionId } = req.params;
    const { videoLang, codeLang, instructorName, adminFeedback } = req.body;

    const acceptedSubmission = await submissionsService.acceptSubmission({
      submissionId,
      adminId,
      videoLang,
      codeLang,
      instructorName,
      adminFeedback,
    });

    res.status(200).json({
      message: 'Submission accepted successfully',
      data: acceptedSubmission,
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectSubmission(
  req: Request<AcceptSubmissionParamsInput, {}, RejectSubmissionInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.userId!;
    const { submissionId } = req.params;
    const { adminFeedback } = req.body;

    await submissionsService.rejectSubmission({
      submissionId,
      adminId,
      adminFeedback,
    });

    res.status(200).json({
      message: 'Submission rejected successfully',
    });
  } catch (error) {
    next(error);
  }
}
