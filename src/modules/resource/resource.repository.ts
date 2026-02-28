import {
  and,
  count,
  desc,
  eq,
  like,
  ne,
  notInArray,
  or,
  SQL,
} from 'drizzle-orm';
import { db } from '../../db/index.js';

import { Transaction } from '../reviews/reviews.types.js';
import { NewResource, Resource, resources } from '../../db/schema/resources.js';

export const resourceRepository = {
  buildResourceFilters(params: {
    search?: string;
    codeLang?: string;
    topic?: string;
    type?: 'video' | 'playlist';
  }): SQL | undefined {
    const { search, codeLang, topic, type } = params;
    let conditions = [];

    if (codeLang) {
      conditions.push(eq(resources.codeLang, codeLang));
    }

    if (topic) {
      conditions.push(eq(resources.topic, topic));
    }

    if (type) {
      conditions.push(eq(resources.type, type));
    }

    if (search?.trim()) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(resources.title, searchTerm),
          like(resources.channelName, searchTerm)
        )
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  },

  async findById(resourceId: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, resourceId));

    return resource;
  },

  async updateAvgRating(
    newAverage: string,
    resourceId: string,
    tx: Transaction
  ): Promise<void> {
    await tx
      .update(resources)
      .set({
        avgRating: newAverage,
      })
      .where(eq(resources.id, resourceId));
  },

  async findByVideoId(videoId: string): Promise<Resource | undefined> {
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.videoId, videoId));

    return resource;
  },

  async findByPlaylistId(playlistId: string): Promise<Resource | undefined> {
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.playlistId, playlistId));

    return resource;
  },

  async findBasicById(
    resourceId: string
  ): Promise<Pick<Resource, 'id' | 'topic' | 'codeLang'> | undefined> {
    const [currentResource] = await db
      .select({
        id: resources.id,
        topic: resources.topic,
        codeLang: resources.codeLang,
      })
      .from(resources)
      .where(eq(resources.id, resourceId));

    return currentResource;
  },

  async findRelatedByTopicAndCodeLang(
    currentId: string,
    topic: string,
    codeLang: string,
    limit: number
  ): Promise<Resource[]> {
    return await db.query.resources.findMany({
      where: and(
        eq(resources.topic, topic),
        eq(resources.codeLang, codeLang),
        ne(resources.id, currentId)
      ),
      limit: limit,
      orderBy: desc(resources.avgRating),
    });
  },

  async findRelatedByTopic(
    currentId: string,
    topic: string,
    excludeIds: string[],
    limit: number
  ): Promise<Resource[]> {
    const conditions = [
      eq(resources.topic, topic),
      ne(resources.id, currentId),
    ];

    if (excludeIds.length > 0) {
      conditions.push(notInArray(resources.id, excludeIds));
    }

    return await db.query.resources.findMany({
      where: and(...conditions),
      limit: limit,
      orderBy: desc(resources.avgRating),
    });
  },

  async findTopRated(
    currentId: string,
    excludeIds: string[],
    limit: number
  ): Promise<Resource[]> {
    const conditions = [ne(resources.id, currentId)];

    if (excludeIds.length > 0) {
      conditions.push(notInArray(resources.id, excludeIds));
    }

    return await db.query.resources.findMany({
      where: and(...conditions),
      limit,
      orderBy: desc(resources.avgRating),
    });
  },

  async findAllPaginated(params: {
    search?: string;
    codeLang?: string;
    topic?: string;
    type?: 'video' | 'playlist';
    limit: number;
    offset: number;
  }): Promise<Resource[]> {
    const { limit, offset } = params;

    const whereClause = this.buildResourceFilters(params);

    const data = await db
      .select()
      .from(resources)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(resources.createdAt));

    return data;
  },

  async countResources(params: {
    search?: string;
    codeLang?: string;
    topic?: string;
    type?: 'video' | 'playlist';
  }): Promise<number> {
    const whereClause = this.buildResourceFilters(params);

    const [countResult] = await db
      .select({ count: count() })
      .from(resources)
      .where(whereClause);

    return Number(countResult?.count ?? 0);
  },

  async create(data: NewResource): Promise<Resource | undefined> {
    const [newResource] = await db.insert(resources).values(data).returning();

    return newResource;
  },

  async delete(resourceId: string): Promise<Resource | undefined> {
    const [deletedResource] = await db
      .delete(resources)
      .where(eq(resources.id, resourceId))
      .returning();

    return deletedResource;
  },
};
