import { z } from 'zod';

export const ExperienceLevelEnum = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'professional'
]);

export const CollaborationTypeEnum = z.enum([
  'band',
  'solo',
  'session',
  'teaching',
  'jamming',
  'recording'
]);

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  instruments: z.array(z.string()).min(1, 'At least one instrument is required'),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  location: z.string().optional(),
  availability: z.string().optional(),
  bio: z.string().max(1000, 'Bio too long').optional(),
  experienceLevel: ExperienceLevelEnum,
  collaborationType: CollaborationTypeEnum
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ email: true });

export const UserQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  instruments: z.string().optional(),
  genres: z.string().optional(),
  location: z.string().optional(),
  experienceLevel: ExperienceLevelEnum.optional(),
  collaborationType: CollaborationTypeEnum.optional()
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelEnum>;
export type CollaborationType = z.infer<typeof CollaborationTypeEnum>;