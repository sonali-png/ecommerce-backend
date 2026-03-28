import CategoryService from "../services/CategoryService.js";

export const getCategoryForm = async(req, res) => {
    try {
        const categories  = await CategoryService.getAllCategories();
        res.status(201).render("categories/add",
            {
              success: true,
              title: "Add Category",
              pageAction: "add",
              categories
          });
    } catch (error) {
        res.status(500).render("categories/add", {
            success: false,
            error: error.message,
            title: "Add Category",
            pageAction:"add"
        });
    }
}

export const getCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { categories, total } = await CategoryService.getCategories(page, limit);

    res.status(201).render("categories/list", {
      success: true,
      title: "Categories list",
      total,
      page,
      pages: Math.ceil(total /limit),
      categories
    });
    
  } catch (error) {
    res.status(500).render("categories/list", {
      success: false,
      error: error.message,
      title: "Categories list",
    });
  }
};


export const createCategory = async (req, res) => {
  try {

    const newCategory = await CategoryService.createCategory({
      ...req.body,
      parentCategory: req.body.parentCategory || null,
      status : req.body.status === "on" ? true : false, 
    });
    res.status(201).render("categories/add", {
      success: true,
      title: "Add Category",
      category: newCategory,
      message: "Category added successfully",
    });
  } catch (error) {
    res.status(400).render("categories/add", {
      success: false,
      title: "Add Catgeory",
      message: error.message,
    });
  }
};