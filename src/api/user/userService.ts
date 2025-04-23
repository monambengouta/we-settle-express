import { StatusCodes } from "http-status-codes";

import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import User from "@/models/User";
import { JwtService } from "@/common/utils/accessToken";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}



	// Retrieves a single user by their ID
	async findById(id: string): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByIdAsync(id);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user);
		} catch (ex) {
			const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
	async loginByEmailAndPasswordAsync(email: string, password: string): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByEmailAndPasswordAsync(email, password);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			const userWithoutPassword = { ...user.toJSON(), password: undefined };

			// generate AccessToken
			const jwtService = new JwtService();
			const accessToken = jwtService.generateToken({ user: userWithoutPassword }, { expiresIn: "1h" });

			return ServiceResponse.success<User>("User found", { ...userWithoutPassword, accessToken: accessToken } as unknown as User);

		} catch (ex) {
			const errorMessage = `Error finding user with email ${email} password: ${password}:, ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const userService = new UserService();
