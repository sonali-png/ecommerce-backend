import CategoryRepository from "../repositories/CategoryRepository.js";
const CategoryRepo = new CategoryRepository();

const CategoryService = {
  getCategories:async (page, limit) => {
    return await CategoryRepo.findAll(page, limit);
  },
  getAllCategories:async () => {
    return await CategoryRepo.find();
  },
  getCategoryById:async (id) => {
    return await CategoryRepo.findById(id);
  },
  createCategory:async (data) => {
    return await CategoryRepo.create(data);
  }
}
export default CategoryService;
