import { Router } from "express";
import {addCheckout, getCheckoutUser} from '../controllers/checkout.controllers.js'

const router = Router();

router.route("/current-checkout").get(getCheckoutUser);
router.route("/add-checkout").post(addCheckout);

export default router;