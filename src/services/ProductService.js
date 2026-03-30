import ProductRepository from "../repositories/ProductRepository.js";
const ProductRepo = new ProductRepository();

const ProductService = {
  getProducts:async (limit, offset) => {
    return await ProductRepo.findAll(limit, offset);
  },
  getProductById:async (id) => {
    return await ProductRepo.findById(id);
  },
  getProductsByIds:async (ids) => {
    return await ProductRepo.findByIds(ids);
  },
  createProduct:async (data) => {
    return await ProductRepo.create(data);
  },
  getAllSizes:async()=> {
    return await ProductRepo.findAllSizes();
  }
}
export default ProductService;
