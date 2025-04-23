import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { JwtService } from "@/common/utils/accessToken";
import type Inscription from "@/models/Inscription";
import { logger } from "@/server";
import { InscriptionRepository } from "./inscriptionRepository";

export class InscriptionService {
	private inscriptionRepository: InscriptionRepository;

	constructor(repository: InscriptionRepository = new InscriptionRepository()) {
		this.inscriptionRepository = repository;
	}

	/**
	 * Validate an inscription by user ID.
	 * @param Inscription_id - The ID of the inscription to validate.
	 * @returns A ServiceResponse indicating the result of the operation.
	 */
	async validateInscription(Inscription_id: string): Promise<
		ServiceResponse<{
			validated: boolean;
		} | null>
	> {
		try {

			// it return sequilize inscription object
			const inscriptionObject =
				await this.inscriptionRepository.findInscriptionByIdAsync(
					Inscription_id
				)



			if (!inscriptionObject) {
				return ServiceResponse.failure(
					"Inscription not found",
					null,
					StatusCodes.NOT_FOUND
				);
			}
			// it return plain object of inscription
			const insc = inscriptionObject?.toJSON()

			const jwtService = new JwtService()
			if (!insc.validated) {
				// generate a new token
				const newToken = jwtService.generateToken({
					user_id: insc.user_id,
					inscription_id: insc.id,

				}, {});


				inscriptionObject.setDataValue("bearer_token", newToken);
				inscriptionObject.setDataValue("validation_date", new Date());
				inscriptionObject.setDataValue("validated", true);
				inscriptionObject.save();

				return ServiceResponse.success<{
					validated: boolean;
				}>("Inscription found", { validated: true });
			}

			if (insc.bearer_token) {
				// check if the token is expired
				const isTokenExpired = jwtService.isTokenExpired(insc.bearer_token);
				if (isTokenExpired) {
					// generate a new token
					const newToken = jwtService.generateToken({
						user_id: insc.id,
						inscription_id: insc.id,

					}, {});
					inscriptionObject.setDataValue("bearer_token", newToken);
					inscriptionObject.setDataValue("validation_date", new Date());
					inscriptionObject.setDataValue("validated", true);
					inscriptionObject.save();

					return ServiceResponse.success<{
						validated: boolean;
					}>("Inscription found", { validated: true });
				}

				this.sendTokenToUser(insc.id);


				return ServiceResponse.success<{
					validated: boolean;
				}>("Inscription found", { validated: true });
				// biome-ignore lint/style/noUselessElse: <explanation>
			} else {
				this.sendTokenToUser(insc.id);

			}
			return ServiceResponse.success<{
				validated: boolean;
			}>("Inscription found", { validated: true });


		} catch (ex) {
			const errorMessage = `Error finding Inscription with id ${Inscription_id}:, ${(ex as Error).message
				}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while finding Inscription.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	public sendTokenToUser = async (inscriptionId: Inscription["id"]): Promise<void> => {
		// not implemented yet
		logger.info("Sending token to user: ", inscriptionId);
	}
}

export const inscriptionService = new InscriptionService();
