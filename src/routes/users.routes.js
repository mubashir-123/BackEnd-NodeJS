import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, updateAccountDetails, changeCurrentPassword, updateAvatar, updatecoverImage, verifyOTP } from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  registerUser
)

router.route("/login").post(loginUser);



// secure route
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/currentuser").get(verifyJWT,getCurrentUser);
router.route("/update-details").patch(verifyJWT,updateAccountDetails);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updatecoverImage)
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-otp").post(verifyOTP);

export default router;
