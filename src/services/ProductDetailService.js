import ProductDetailRepository from "../repositories/ProductDetailRepository.js";
const ProductDetailRepo = new ProductDetailRepository();

const ProductDetailService = {
  getProductDetails:async () => {
    return await ProductDetailRepo.findAll();
  },
  getProductDetailsById:async (id) => {
    return await ProductDetailRepo.findById(id);
  },
  createProductInDetail:async (data) => {
    return await ProductDetailRepo.create(data);
  }
}
export default ProductDetailService;
