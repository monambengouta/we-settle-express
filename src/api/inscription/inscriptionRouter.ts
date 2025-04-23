import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type RequestHandler, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticateJWT } from "@/common/middleware/authMiddleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import { inscriptionController } from "./InscriptionController";
import { GenerateAccessTokenForInscriptionSchema, GenerateAccessTokenForInscriptionSchemaResponseSchema, GetInscriptionsResponseSchema, InscriptionSchema, ValidateInscriptionResponseSchema, ValidateInscriptionSchema } from "./inscriptionSchema";

export const inscriptionRegistry = new OpenAPIRegistry();
export const inscriptionRouter: Router = express.Router();

inscriptionRegistry.registerComponent('securitySchemes', 'bearerAuth', {
	type: 'http',
	scheme: 'bearer',
	bearerFormat: 'JWT',
	description: 'Enter JWT token in the format: Bearer <token>'
});


inscriptionRegistry.register("Inscription", InscriptionSchema);

inscriptionRegistry.registerPath({
	method: "get",
	path: "/inscriptions/all",
	tags: ["Inscription"],
	security: [{ bearerAuth: [] }], // This marks the endpoint as protected
	responses: {
		...createApiResponse(GetInscriptionsResponseSchema, "Success"),
		401: { description: "Unauthorized - Invalid or missing token" },
		403: { description: "Forbidden - Insufficient permissions" },
	}
});
inscriptionRouter.get(
	"/all",
	authenticateJWT, // Middleware to check JWT token
	inscriptionController.GetAllInscriptions,
);

inscriptionRegistry.registerPath({
	method: "post",
	path: "/inscriptions/validate/{subId}",
	tags: ["Inscription"],
	security: [{ bearerAuth: [] }], // This marks the endpoint as protected
	request: {
		params: ValidateInscriptionSchema.shape.params,

	},
	responses: {
		...createApiResponse(ValidateInscriptionResponseSchema, "Success"),
		401: { description: "Unauthorized - Invalid or missing token" },
		403: { description: "Forbidden - Insufficient permissions" },
	}
});

inscriptionRouter.post(
	"/validate/:subId",
	validateRequest(ValidateInscriptionSchema) as RequestHandler,
	authenticateJWT, // Middleware to check JWT token
	inscriptionController.ValidateInscription,
);

inscriptionRegistry.registerPath({
	method: "post",
	path: "/inscriptions/g-token/{subId}",
	tags: ["Inscription"],
	security: [{ bearerAuth: [] }], // This marks the endpoint as protected
	request: {
		params: GenerateAccessTokenForInscriptionSchema.shape.params,

	},
	responses: {
		...createApiResponse(GenerateAccessTokenForInscriptionSchemaResponseSchema, "Success"),
		401: { description: "Unauthorized - Invalid or missing token" },
		403: { description: "Forbidden - Insufficient permissions" },
	}
});

inscriptionRouter.post(
	"/g-token/:subId",
	validateRequest(GenerateAccessTokenForInscriptionSchema) as RequestHandler,
	inscriptionController.SendAccessToken,
);
