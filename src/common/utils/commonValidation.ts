import { z } from "zod";

export const commonValidations = {
	id: z.string().uuid("Invalid ID format"),
	// ... other common validations
};
