import { z } from "zod";
import { TripStatus, ActivityType, ExpenseCategory, ShareRole } from "@prisma/client";

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  image: z.string().url().optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  firstName: z.string().min(1).max(50).optional().nullable(),
  lastName: z.string().min(1).max(50).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  currency: z.string().max(3).optional(),
  image: z.string().url().optional().nullable(),
});

export const createTripSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().max(2000).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  budget: z.coerce.number().min(0).optional().default(0),
  currency: z.string().max(3).optional().default("USD"),
  coverImage: z.string().url().optional().nullable(),
  status: z.nativeEnum(TripStatus).optional().default(TripStatus.DRAFT),
});

export const updateTripSchema = createTripSchema.partial().extend({
  isPublic: z.boolean().optional(),
});

export const createTripStopSchema = z.object({
  cityId: z.string().min(1, "City ID is required"),
  orderIndex: z.number().int().min(0).optional(),
  arrivalDate: z.coerce.date().optional().nullable(),
  departureDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateTripStopSchema = z.object({
  orderIndex: z.number().int().min(0).optional(),
  arrivalDate: z.coerce.date().optional().nullable(),
  departureDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const reorderStopsSchema = z.object({
  stopIds: z.array(z.string()).min(1),
});

export const addActivitySchema = z.object({
  activityId: z.string().min(1, "Activity ID is required"),
  orderIndex: z.number().int().min(0).optional(),
  scheduledDate: z.coerce.date().optional().nullable(),
  startTime: z.string().max(10).optional().nullable(),
  endTime: z.string().max(10).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  actualCost: z.coerce.number().min(0).optional().nullable(),
});

export const updateActivitySchema = z.object({
  orderIndex: z.number().int().min(0).optional(),
  scheduledDate: z.coerce.date().optional().nullable(),
  startTime: z.string().max(10).optional().nullable(),
  endTime: z.string().max(10).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  actualCost: z.coerce.number().min(0).optional().nullable(),
});

export const reorderActivitiesSchema = z.object({
  activityIds: z.array(z.string()).min(1),
});

export const createExpenseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().max(1000).optional().nullable(),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  currency: z.string().max(3).optional().default("USD"),
  category: z.nativeEnum(ExpenseCategory).default(ExpenseCategory.MISCELLANEOUS),
  date: z.coerce.date().optional(),
  tripStopId: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const searchCitiesSchema = z.object({
  query: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  minCostIndex: z.coerce.number().int().optional(),
  maxCostIndex: z.coerce.number().int().optional(),
  sortBy: z.enum(["popularity", "name", "costIndex"]).default("popularity"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchActivitiesSchema = z.object({
  query: z.string().max(100).optional(),
  cityId: z.string().optional(),
  type: z.nativeEnum(ActivityType).optional(),
  minCost: z.coerce.number().optional(),
  maxCost: z.coerce.number().optional(),
  minDuration: z.coerce.number().int().optional(),
  maxDuration: z.coerce.number().int().optional(),
  minRating: z.coerce.number().optional(),
  sortBy: z.enum(["popularity", "rating", "cost", "duration", "name"]).default("popularity"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const shareTripSchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().optional(),
  role: z.nativeEnum(ShareRole).default(ShareRole.VIEWER),
  canEdit: z.boolean().default(false),
});

export const updateShareSchema = z.object({
  role: z.nativeEnum(ShareRole).optional(),
  canEdit: z.boolean().optional(),
  accepted: z.boolean().optional(),
});

export const copyTripSchema = z.object({
  title: z.string().optional(),
  includeActivities: z.boolean().default(true),
  includeExpenses: z.boolean().default(false),
});

export const createCommunityPostSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  content: z.string().min(2, "Content must be at least 2 characters").max(5000),
  imageUrl: z.string().url().optional().nullable(),
  tripId: z.string().optional().nullable(),
  cityId: z.string().optional().nullable(),
});

export const createCommunityCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

export const searchCommunityPostsSchema = z.object({
  query: z.string().max(100).optional(),
  cityId: z.string().optional(),
  sortBy: z.enum(["recent", "popular"]).default("recent"),
});

export const importCitySchema = z.object({
  geoDbId: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  population: z.number().optional().nullable(),
  timezone: z.string().optional().nullable(),
});

export const importActivitySchema = z.object({
  cityId: z.string().min(1),
  xid: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(ActivityType),
  rating: z.number().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  address: z.string().optional().nullable(),
  costEstimate: z.number().optional().nullable(),
  durationMinutes: z.number().optional().nullable(),
});
