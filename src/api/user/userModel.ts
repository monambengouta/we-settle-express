import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters long"),
	email: z.string().email("Invalid email address"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
