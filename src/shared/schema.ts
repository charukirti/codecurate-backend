import z from 'zod';

export const sort = z.enum(['newest', 'oldest', 'highest', 'lowest']);
export type SortType = z.infer<typeof sort>;
