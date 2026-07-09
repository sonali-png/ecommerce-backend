import Brand from "../models/Brand.js";

class BrandRepository {
    async find() {
        return await Brand.find();
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const categories = await Brand.find().skip(skip).limit(limit);
        const total = await Brand.countDocuments();
        return { categories, total };
    }
    async findById(id) {
        return await Brand.findById(id);
    }
    async create(brandData) {    
        const brand = new Brand(brandData);
        return await brand.save(); 
    }
}

export default BrandRepository;