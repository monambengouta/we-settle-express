import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type RequestHandler, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { inscriptionController } from "./InscriptionController";
import { GenerateAccessTokenForInscriptionSchema, GenerateAccessTokenForInscriptionSchemaResponseSchema, InscriptionSchema, ValidateInscriptionResponseSchema, ValidateInscriptionSchema } from "./inscriptionSchema";

export const inscriptionRegistry = new OpenAPIRegistry();
export const inscriptionRouter: Router = express.Router();

inscriptionRegistry.register("Inscription", InscriptionSchema);

inscriptionRegistry.registerPath({
	method: "post",
	path: "/inscriptions/validate/{subId}",
	tags: ["Inscription"],
	request: {
		params: ValidateInscriptionSchema.shape.params,

	},
	responses: createApiResponse(ValidateInscriptionResponseSchema, "Success"),
});

inscriptionRouter.post(
	"/validate/:subId",
	validateRequest(ValidateInscriptionSchema) as RequestHandler,
	inscriptionController.ValidateInscription,
);

inscriptionRegistry.registerPath({
	method: "post",
	path: "/inscriptions/g-token/{subId}",
	tags: ["Inscription"],
	request: {
		params: GenerateAccessTokenForInscriptionSchema.shape.params,

	},
	responses: createApiResponse(GenerateAccessTokenForInscriptionSchemaResponseSchema, "Success"),
});

inscriptionRouter.post(
	"/g-token/:subId",
	validateRequest(GenerateAccessTokenForInscriptionSchema) as RequestHandler,
	inscriptionController.SendAccessToken,
);
