import ProductService from "../services/ProductService.js";
import ProductDetailService from "../services/ProductDetailService.js";
import CategoryService from "../services/CategoryService.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

export const getProductForm = async(req, res) => {
    try {
      const sizes  = await ProductService.getAllSizes();
      const categories  = await CategoryService.getAllCategories();
      res.status(201).render("products/add",
        {
          success: true,
          title: "Add Product",
          pageAction: "add",
          sizes,
          categories
      });
    } catch (error) {
        res.status(500).render("products/add", {
            success: false,
            error: error.message,
            title: "Add Product",
            pageAction:"add"
        });
    }
}
export const getProducts = async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const nextOffset = offset + limit;
  

  try {
    const { products, total } = await ProductService.getProducts(limit, offset);
    const nextLink = total > nextOffset ? `http://localhost:5000/products?limit=${limit}&offset=${nextOffset}` :''; 

    res.status(201).json({
      success: true,
      total,
      nextLink,
      pages: Math.ceil(total /limit),
      productList:products
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      title: "Product list",
    });
  }
};
export const getProductById = async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body;    
    const products = await ProductService.getProductsByIds(ids);
    if (!products) return res.status(404).json({ message: "Products not found" });
    res.status(201).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {

  try {

    const results = await Promise.all(
      req.files.map(file => cloudinary.uploader.upload(file.path, { folder: "products" }))
    );

    console.log("Cloudinary URLs:", results.map(r => r.secure_url));

    const {
      name,
      description,
      category,
      brand,
      size,
      price,
      discount,
      stock
    } = req.body;

    const _id = new mongoose.Types.ObjectId();
    const newProduct = await ProductService.createProduct({
      _id,
      name,
      description,
      category,
      brand,
      slug:`localhost:3000//${name.toLowerCase().replace(/ /g, "-")}-${_id}`,
      images: results.map(r => r.secure_url)
    });

    const filteredDetails = size.map((sizeId, index) => {
      const p = price[index];
      const s = stock[index];

      if (!p || !s) return null;

      return {
        product_id: newProduct._id,
        size_id: sizeId,
        price: Number(p),
        discount: Number(discount[index] || 0),
        stock: Number(s)
      };
    }).filter(Boolean);
    console.log(`details ${filteredDetails}`);
    await ProductDetailService.createProductInDetail(filteredDetails);

    res.status(201).render('products/add', {
      success: true,
      title: "Add product",
      message: "Product created successfully!"
    });
    return;
  } catch (error) {
    res.status(400).json({
      success: false,
      title: "Add product",
      message: error.message
    });
  }
};