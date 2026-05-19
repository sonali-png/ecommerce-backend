import Product from "../models/Product.js";
import Size from "../models/Size.js"; 
import Brand from "../models/Brand.js";
class ProductRepository {
  async findAll(limit = 10, offset=0) {
    const products = await Product.find().populate("brand", "name")
    .skip(offset)
    .limit(limit);
    const total = await Product.countDocuments();
    return { products, total };
  }
  async findByIds(ids) {
    return await Product.find({_id: {$in: ids}})
  }
  async findById(id) {
    return await Product.findById(id);
  }
  async create(productData) {
    console.log("Saving product with data:", productData); // log input
    
    const product = new Product(productData);
    console.log("Product JSON:", product.toObject());

    console.log("Mongoose document:", product); // log mongoose doc
    return await product.save();
  }
  async findAllSizes() {
    const sizes = Size.find();
    return sizes;
  }
}

export default ProductRepository;