import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const InscriptionSchema = z.object({
	id: z.string().uuid(),
	user_id: z.string().uuid(),
	name: z.string().min(1, "Name is required"),
	lastname: z.string().min(1, "Lastname is required"),
	email: z.string().email("Invalid email address"),
	validated: z.boolean().default(false),
	bearer_token: z.string().nullable().optional(),
	validation_date: z.date().nullable().optional(),
});

// Input Validation for 'GET users/:id' endpoint
export const ValidateInscriptionSchema = z.object({
	params: z.object({ subId: commonValidations.id }),
});

export const ValidateInscriptionResponseSchema = z.object({
	validated: z.boolean(),
});

export const GenerateAccessTokenForInscriptionSchema = z.object({
	params: z.object({ subId: commonValidations.id }),
});

export const GenerateAccessTokenForInscriptionSchemaResponseSchema = z.object({
	validated: z.boolean(),
	tokenSent: z.boolean(),
	tokenRefreshed: z.boolean(),
});

export const GetInscriptionsResponseSchema = z.array(
	InscriptionSchema.omit({
		bearer_token: true,
		validation_date: true,
	})
)