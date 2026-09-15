import {
  findAllProducts,
  createProduct,
  updateProduct,
  deleteProduct as deleteProductModel,
} from "../models/productModel.js";

/**
 * GET /api/products
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await findAllProducts();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * POST / PUT /api/products/manage
 * Prices are handled in ₹ INR
 */
export const manageProduct = async (req, res) => {
  const productId = req.params.id;

  let {
    name,
    description,
    price,
    stock_quantity,
    image_url,
    category_id,
  } = req.body;

  // Convert to correct types (₹ INR)
  const priceInr = Number(price);
  const stockQuantity = Number(stock_quantity);
  const categoryId = Number(category_id);

  if (!name || priceInr <= 0 || stockQuantity < 0 || !categoryId) {
    return res.status(400).json({
      error: "Missing or invalid required fields",
    });
  }

  try {
    let product;

    if (productId) {
      product = await updateProduct(
        productId,
        name,
        description,
        priceInr,
        stockQuantity,
        image_url || null,
        categoryId
      );
      return res.json({ message: "Product updated", product });
    }

    product = await createProduct(
      name,
      description,
      priceInr,
      stockQuantity,
      image_url || null,
      categoryId
    );

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("Error managing product:", err);
    res.status(500).json({ error: "Product save failed" });
  }
};

/**
 * DELETE /api/products/manage/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    await deleteProductModel(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};
