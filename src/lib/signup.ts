import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email");

export const studentSchema = z.object({
  type: z.literal("student"),
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: email.refine((v) => v.endsWith("@utdallas.edu"), "Use your @utdallas.edu email"),
  year: z.string().min(1, "Pick one"),
  major: z.string().trim().min(2, "Tell us your major").max(80),
  interests: z.array(z.string()).min(1, "Pick at least one"),
  goals: z.array(z.string()).min(1, "Pick at least one"),
});

export const companySchema = z.object({
  type: z.literal("company"),
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email,
  company: z.string().trim().min(2, "Tell us the company").max(120),
  interests: z.array(z.string()).min(1, "Pick at least one"),
  message: z.string().trim().max(1000).optional().default(""),
});

export const signupSchema = z.discriminatedUnion("type", [studentSchema, companySchema]);
export type Signup = z.infer<typeof signupSchema>;
