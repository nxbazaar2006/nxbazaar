import { z } from "zod";

/* -------- CREATE USER -------- */

export const createUserSchema = z.object({
  name: z.string().min(3, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be 6 characters"),
  role: z.enum(["USER", "SELLER", "ADMIN"]).default("USER"),
});

/* -------- UPDATE USER -------- */

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["USER", "SELLER", "ADMIN"]).optional(),
});



export const verifyEmailSchema = z.object({
  id: z.string().min(1, "User id required"),
  token: z.string().optional(),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;


export const userSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export type UserType = z.infer<typeof userSchema>;

export const profileSettingsSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  dateOfBirth: z.string().optional(),
  profileImage: z.string().optional(),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
