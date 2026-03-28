import Category from "../models/Category.js";

class CategoryRepository {
    async find() {
        return await Category.find();
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const categories = await Category.find().skip(skip).limit(limit);
        const total = await Category.countDocuments();
        return { categories, total };
    }
    async findById(id) {
        return await Category.findById(id);
    }
    async create(categoryData) {    
        const category = new Category(categoryData);
        return await category.save(); 
    }
}

export default CategoryRepository;