import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {addCheckout, getCheckoutUser} from '../controllers/checkout.controllers.js'

const router = Router();

router.route("/checkout").get(getCheckoutUser);
router.route("/checkout").post(addCheckout);

export default router;