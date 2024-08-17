import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct } from '../controllers/products.controllers.js';

const router = Router()

router.route("/all-products").get(getAllProducts);
router.route("/render-product/:id").get(getProductById);
router.route("/add-products").post(
      upload.fields([{name: "productImage",maxCount: 1}]),
 addProduct);
router.route("/update-products/:id").patch(verifyJWT,upload.single("productImage"),updateProduct);
router.route("/products/:id").delete(deleteProduct);

export default router;