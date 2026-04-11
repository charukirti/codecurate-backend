import { Resource, Submission } from '../../db/schema/index.js';
import {
  ConflictError,
  InternalError,
  NotFoundError,
} from '../../shared/errors.js';
import { extractVideoUrl } from '../../utils/extractVideoUrl.js';
import { resourceRepository } from '../resource/resource.repository.js';

import { CreateSubmissionInput } from './submissions.schema.js';
import { resourceService } from '../resource/resource.service.js';
import { submissionsRepository } from './submissions.repository.js';

export const submissionsService = {
  /**
   * Creates a new submission for a YouTube video or playlist. It checks for existing resources and pending submissions to prevent duplicates.
   * @param userId : The ID of the user making the submission.
   * @param data : An object containing the YouTube URL, title, description, and topic of the submission.
   * @throws {ConflictError} If a resource with the same video or playlist ID already exists, or if there's a pending submission with the same YouTube URL.
   * @throws {InternalError} If the submission creation fails due to a database error.
   * @returns A promise resolving to the created submission.
   */

  async createSubmissions(
    userId: string,
    data: CreateSubmissionInput
  ): Promise<Submission> {
    const { youtubeURL, title, description, topic } = data;

    const { videoId, playlistId } = extractVideoUrl(youtubeURL);

    if (videoId) {
      const existing = await resourceRepository.findByVideoId(videoId);
      if (existing)
        throw new ConflictError('This video already exists in the  library.');
    }
    if (playlistId) {
      const existing = await resourceRepository.findByPlaylistId(playlistId);
      if (existing)
        throw new ConflictError(
          'This playlist already exists in the  library.'
        );
    }

    const pendingSubmissins =
      await submissionsRepository.findPendingByURL(youtubeURL);

    if (pendingSubmissins)
      throw new ConflictError(
        'A submission with this YouTube URL is already pending review.'
      );

    const newSubmission = await submissionsRepository.create({
      userId,
      youtubeURL,
      title,
      description,
      topic,
    });

    if (!newSubmission) {
      throw new InternalError(
        'Failed to create submission. Please try again later.'
      );
    }

    return newSubmission;
  },

  /**
   * gets all submissions made by a specific user.
   * @param userId : The ID of the user whose submissions are to be retrieved.
   * @returns {Promise<Submission[]>} A promise that resolves to an array of submissions made by the user.
   */

  async getSubmissionsByUserId(userId: string): Promise<Submission[]> {
    const userSubmissions = await submissionsRepository.findByUserId(userId);

    return userSubmissions;
  },

  /**
   * Retrieves all submissions with optional filtering by status and pagination support for admin panel.
   * It calculates the total number of items and pages based on the provided limit.
   * @param params : An object containing optional status filter, page number, and limit for pagination.
   * @returns A promise that resolves to an object containing the array of submissions and pagination details (current page, limit, total items, total pages).
   */

  async getAllSubmissions(params: {
    status?: 'pending' | 'accepted' | 'rejected';
    page: number;
    limit: number;
  }): Promise<{
    data: Submission[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const { status, page, limit } = params;
    const offset = (page - 1) * limit;

    const data = await submissionsRepository.findAllPaginated({
      status,
      offset,
      limit,
    });

    const totalItems = status
      ? await submissionsRepository.countByStatus(status)
      : await submissionsRepository.countAll();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  /**
   * Accepts a submission by its ID, extracts resource information from the YouTube URL, creates a new resource in the library, and updates the submission status to 'accepted'.
   * It checks for the existence of the submission, ensures it is not already accepted or rejected, and handles the extraction of video or playlist information to create the resource.
   * @param params : An object containing the submission ID, admin ID, video language, optional code language, instructor name, and optional admin feedback.
   * @throws {NotFoundError} If the submission with the given ID does not exist.
   * @throws {ConflictError} If the submission is already accepted or rejected.
   * @returns A promise that resolves to the created resource.
   */

  async acceptSubmission(params: {
    submissionId: string;
    adminId: string;
    videoLang: string;
    codeLang?: string;
    instructorName: string;
    adminFeedback?: string;
  }): Promise<Resource> {
    const {
      submissionId,
      adminId,
      videoLang,
      codeLang,
      instructorName,
      adminFeedback,
    } = params;

    const submission = await submissionsRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError('This submission does not exist.');
    }

    if (submission.status === 'accepted') {
      throw new ConflictError('Submission is already accepted.');
    }

    if (submission.status === 'rejected') {
      throw new ConflictError('Rejected submissions cannot be accepted.');
    }

    const { videoId } = extractVideoUrl(submission.youtubeURL);

    const resource = await resourceService.extractFromUrl({
      url: submission.youtubeURL,
      videoLang,
      codeLang,
      topic: submission.topic,
      resourceType: videoId ? 'video' : 'playlist',
      instructorName,
      description: submission.description ?? undefined,
    });

    await submissionsRepository.updateToAccepted({
      submissionId,
      adminId,
      adminFeedback,
    });

    return resource;
  },

  /**
   * Rejects a submission by its ID, updates the submission status to 'rejected', and optionally saves admin feedback. It checks for the existence of the submission and ensures it is not already accepted or rejected before performing the update.
   * @param params : An object containing the submission ID, admin ID, and optional admin feedback.
   * @throws {NotFoundError} If the submission with the given ID does not exist.
   * @throws {ConflictError} If the submission is already accepted or rejected.
 
   */
  async rejectSubmission(params: {
    submissionId: string;
    adminId: string;
    adminFeedback?: string;
  }): Promise<void> {
    const { submissionId, adminId, adminFeedback } = params;

    const submission = await submissionsRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError('This submission does not exist.');
    }

    if (submission.status === 'accepted') {
      throw new ConflictError('Accepted submissions cannot be rejected.');
    }

    if (submission.status === 'rejected') {
      throw new ConflictError('Submission is already rejected.');
    }

    await submissionsRepository.updateToRejected({
      submissionId,
      adminId,
      adminFeedback,
    });
  },
};
