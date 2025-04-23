import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { healthCheckRegistry } from "@/api/v1/healthCheck/healthCheckRouter";
import { inscriptionRegistry } from "@/api/v1/inscription/inscriptionRouter";
import { userRegistry } from "@/api/v1/user/userRouter";

export function generateOpenAPIDocument() {
	const registry = new OpenAPIRegistry([healthCheckRegistry, userRegistry, inscriptionRegistry]);

	// Register security scheme
	registry.registerComponent('securitySchemes', 'bearerAuth', {
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT',
		description: 'Enter JWT token in the format: Bearer <token>'
	});

	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Swagger API",
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
		// Apply security globally to all endpoints
		security: [{ bearerAuth: [] }]
	});
}