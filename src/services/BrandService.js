import BrandRepository from "../repositories/BrandRepository.js";
const BrandRepo = new BrandRepository();

const BrandService = {
  getAllBrands:async (page, limit) => {
    return await BrandRepo.findAll(page, limit);
  },
  getBrand:async () => {
    return await BrandRepo.find();
  },
  getBrandById:async (id) => {
    return await BrandRepo.findById(id);
  },
  createBrand:async (data) => {
    return await BrandRepo.create(data);
  }
}
export default BrandService;
