
import User from "@/models/User";


export class UserRepository {

	async findByIdAsync(id: string): Promise<User | null> {
		return User.findOne({
			where: {
				user_id: id,
			}
		});
	}
	async findByEmailAndPasswordAsync(email: string, password: string): Promise<User | null> {
		return User.findOne({
			where: {
				email: email,
				password: password,
			}
		});

	}
}
