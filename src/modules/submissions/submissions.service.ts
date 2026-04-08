import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { Submission, submissions } from '../../db/schema/index.js';
import { ConflictError, InternalError } from '../../shared/errors.js';
import { extractVideoUrl } from '../../utils/extractVideoUrl.js';
import { resourceRepository } from '../resource/resource.repository.js';

import { CreateSubmissionInput } from './submissions.schema.js';

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

    /* TODO: Extract db queries to the repository files later. */
    const pendingSubmissins = await db.query.submissions.findFirst({
      where: and(
        eq(submissions.youtubeURL, youtubeURL),
        eq(submissions.status, 'pending')
      ),
    });

    if (pendingSubmissins)
      throw new ConflictError(
        'A submission with this YouTube URL is already pending review.'
      );

    const [newSubmission] = await db
      .insert(submissions)
      .values({
        userId,
        youtubeURL,
        title,
        description,
        topic,
      })
      .returning();

    if (!newSubmission) {
      throw new InternalError(
        'Failed to create submission. Please try again later.'
      );
    }

    return newSubmission;
  },
};
