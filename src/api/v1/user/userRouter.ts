import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type RequestHandler, type Router } from "express";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, LoginResponseSchema, LoginSchema, UserSchema } from "@/api/v1/user/userSchema";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

const API_VERSION = "v1";
export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
	method: "get",
	path: `/api/${API_VERSION}/users/{id}`,
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", validateRequest(GetUserSchema) as RequestHandler, userController.getUser);

userRegistry.registerPath({
	method: "post",
	path: `/api/${API_VERSION}/users/login`,
	tags: ["User"],
	request: {
		body: {
			content: { "application/json": { schema: LoginSchema.shape.body } },
			description: "Login request body",
			required: true,
		},
	},
	responses: createApiResponse(LoginResponseSchema, "Success"),
});

userRouter.post("/login", validateRequest(LoginSchema) as RequestHandler, userController.LoginByEmailAndPassword);
