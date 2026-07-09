import BrandService from "../services/BrandService.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";

export const getBrands = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { brands, total } = await BrandService.getBrands(page, limit);

    res.send({
      success: true,
      title: "brands list",
      total,
      page,
      pages: Math.ceil(total /limit),
      brands
    });
    
  } catch (error) {
    res.status(500).render("brands/list", {
      success: false,
      error: error.message,
      title: "brands list",
    });
  }
};


export const createBrand = async (req, res) => {
  try {
    const categories = req.query.categories.split(",").map(cat => cat.trim().toLowerCase());
    const categoryDocs = await Category.find({
      slug: { $in: categories }
    }).select("_id");
    const { name="", status=true} = req.query;
    const categoryIds = categoryDocs.map(cat => cat._id);
    const newBrand = await BrandService.createBrand({
      name,
      status,
      categories: categoryIds,
    });
    res.status(201).json( {
      message: "Brand added successfully",
    });
  } catch (error) {
    res.status(400).json( {
      message: error.message,
    });
  }
};

export const getBrandByCategoryId = async(req, res) => {
    try {
      const { categoryId } = req.query;
      console.log(categoryId);

      const brands = await Brand.find({
        categories: categoryId
      }).select("_id name");
      console.log(brands);
      res.json({
        success: true,
        brands
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

