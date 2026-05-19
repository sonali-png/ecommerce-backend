import User from "../models/User.js";

class UserRepository {
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit);
    const total = await User.countDocuments();
    return { users, total };
  }
  async find() {
    const users = await User.find();
    return users;
  }
  async findById(id) {
    return await User.findById(id);
  } 
  async findOne (query, exclude="") {
    const user = await User.findOne( query ).select(exclude);
    return user;
    
  }
  async create(userData) {    
    const user = new User(userData);
    return await user.save(); 
  }
}

export default UserRepository;