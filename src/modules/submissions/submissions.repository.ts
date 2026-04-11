import { and, count, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { NewSubmission, submissions } from '../../db/schema/submissions.js';

export const submissionsRepository = {
  async findPendingByURL(youtubeURL: string) {
    const pendingSubmission = await db.query.submissions.findFirst({
      where: and(
        eq(submissions.youtubeURL, youtubeURL),
        eq(submissions.status, 'pending')
      ),
    });
    return pendingSubmission;
  },

  async create(data: NewSubmission) {
    const [newSubmission] = await db
      .insert(submissions)
      .values(data)
      .returning();
    return newSubmission;
  },

  async findByUserId(userId: string) {
    const userSubmissions = await db.query.submissions.findMany({
      where: eq(submissions.userId, userId),
    });

    return userSubmissions;
  },

  async countAll() {
    const [result] = await db.select({ count: count() }).from(submissions);
    return Number(result?.count) || 0;
  },

  async countByStatus(status: 'pending' | 'accepted' | 'rejected') {
    const [result] = await db
      .select({ count: count() })
      .from(submissions)
      .where(eq(submissions.status, status));
    return Number(result?.count) || 0;
  },

  async findById(submissionId: string) {
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
    });
    return submission;
  },

  async findAllPaginated(params: {
    status?: 'pending' | 'accepted' | 'rejected';
    offset: number;
    limit: number;
  }) {
    const { status, offset, limit } = params;
    return await db.query.submissions.findMany({
      where: status ? eq(submissions.status, status) : undefined,
      orderBy: (submissions, { desc }) => desc(submissions.createdAt),
      limit,
      offset,
    });
  },

  async updateToAccepted(params: {
    submissionId: string;
    adminId: string;
    adminFeedback?: string;
  }) {
    const { submissionId, adminId, adminFeedback } = params;

    await db
      .update(submissions)
      .set({
        status: 'accepted',
        reviewedBy: adminId,
        adminFeedback: adminFeedback ?? null,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId));
  },

  async updateToRejected(params: {
    submissionId: string;
    adminId: string;
    adminFeedback?: string;
  }) {
    const { submissionId, adminId, adminFeedback } = params;

    await db
      .update(submissions)
      .set({
        status: 'rejected',
        reviewedBy: adminId,
        adminFeedback: adminFeedback ?? null,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId));
  },
};
