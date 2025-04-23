
import User from "@/models/User";


export class UserRepository {

	async findByIdAsync(id: string): Promise<User | null> {
		try {
			const u = await User.findOne({
				where: {
					user_id: id,
				}
			});
			return u
		} catch (error) {
			console.error("Error finding user by ID:", error);
			return null;
		}
	}
}
