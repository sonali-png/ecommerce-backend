import ProductDetail from "../models/ProductDetail.js";
class ProductDetailRepository {
  async getProductDetails(limit = 10, offset=0) {
    return await ProductDetail.find()
  }
  async findById(id) {
    return await ProductDetail.findById(id);
  }
  async create(productData) {
    console.log("Saving product with data:", productData); // log input
    
    const productDetail = new ProductDetail(productData);
    console.log("Product JSON:", productDetail.toObject());
    if (Array.isArray(productData)) {
      return await ProductDetail.insertMany(productData);
    }
    
    console.log("Mongoose document:", productDetail); // log mongoose doc
    return await productDetail.save();
  }
}

export default ProductDetailRepository;