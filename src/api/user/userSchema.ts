import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	user_id: commonValidations.id,
	password: z.string().min(8, "Password must be at least 8 characters long"),
	email: z.string().email("Invalid email address"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});


export const LoginSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters long"),
	}),
});

export const LoginResponseSchema = z.object({
	message: z.string(),
	data: UserSchema.omit({ password: true }).merge(
		z.object({
			token: z.string().optional(),
			refreshToken: z.string().optional(),
		})),
});