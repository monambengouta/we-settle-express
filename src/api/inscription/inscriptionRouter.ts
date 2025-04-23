import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type RequestHandler, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { inscriptionController } from "./InscriptionController";
import { InscriptionSchema, ValidateInscriptionResponseSchema, ValidateInscriptionSchema } from "./inscriptionSchema";

export const inscriptionRegistry = new OpenAPIRegistry();
export const inscriptionRouter: Router = express.Router();

inscriptionRegistry.register("Inscription", InscriptionSchema);
inscriptionRegistry.registerPath({
	method: "post",
	path: "/inscriptions/validate/{user_id}",
	tags: ["Inscription"],
	request: {
		params: ValidateInscriptionSchema.shape.params,

	},
	responses: createApiResponse(ValidateInscriptionResponseSchema, "Success"),
});

inscriptionRouter.post(
	"/validate/:user_id",
	validateRequest(ValidateInscriptionSchema) as RequestHandler,
	inscriptionController.ValidateInscription,
);
