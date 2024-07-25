const router = require("express").Router();
const { where } = require("sequelize");
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    let categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
  }
});

router.get("/:id", async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    let category = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    res.status(200).json(category);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.post("/", async (req, res) => {
  // create a new category
  try {
    const categoryData = await Category.create({
      id: req.body.id,
      category_name: req.body.category_name,
    });
    res.status(200).json(categoryData);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.put("/:id", async (req, res) => {
  // update a category by its `id` value
  try {
    let updatedCategory = await Category.update(
      { category_name: req.body.category_name },
      { where: { id: req.params.id } }
    );

    res.json(200).json(updatedCategory);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.delete("/:id", (req, res) => {
  // delete a category by its `id` value
  try {
    const result = Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (result) {
      res.status(200).json({ message: `Category deleted successfully` });
    } else {
      res.status(404).json({ message: `Category not found` });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: `This error occured while deleting ${err}` });
  }
});

module.exports = router;
