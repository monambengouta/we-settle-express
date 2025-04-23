import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class UserController {

	public getUser: RequestHandler = async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const serviceResponse = await userService.findById(id);
		return handleServiceResponse(serviceResponse, res) as unknown as ReturnType<RequestHandler>;
	};

	public LoginByEmailAndPassword: RequestHandler = async (req: Request, res: Response) => {
		const { email, password } = req.body as { email: string; password: string };
		const serviceResponse = await userService.findByEmailAndPasswordAsync(email, password);
		console.log(`🚀 ~ UserController ~ LoginByEmailAndPassword:RequestHandler= ~ { email, password }:`, { email, password })
		return handleServiceResponse(serviceResponse, res) as unknown as ReturnType<RequestHandler>;
	};
}

export const userController = new UserController();
