import UserRepository from "../repositories/UserRepository.js";
const UserRepo = new UserRepository();

const UserService = {
  getAllUsers: async() => {
    return await UserRepo.find();
  },
  getUsers:async (page, limit) => {
    const usersFromRepo = await UserRepo.findAll(page, limit);
    return usersFromRepo;
  },
  getUserById:async (id) => {
    return await UserRepo.findById(id);
  },
  createUser:async (data) => {
    let result = await UserRepo.create(data);
    return result;
  },
  getDataByFieldName:async(query, exclude="") => {
    return await UserRepo.findOne(query, exclude);
  }
}
export default UserService;
