import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../ApiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { v2 as cloudinary } from "cloudinary";

const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        await user.save({validateBeforeSave: false})
        
        return {accessToken, refreshToken}
    }
    catch (error){
         throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
  //Get user dtails from FrontEnd
  //Validation- Not Empty
  //Check if user already exist: username, email
  //Check for images and avatar
  //Upload them on cloudinary-avatar
  //create user object-create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { fullname, username, email, password } = req.body;
//   console.log("Email: ", email);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existUser = await User.findOne({
    $or : [{username}, {email}]
  })
  if(existUser){
    throw new ApiError(409,"User with email or username is already exist")
  }
   
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar = await uploadonCloudinary(avatarLocalPath);
    // console.log(avatar);
    const coverImage = await uploadonCloudinary(coverImageLocalPath);
    // console.log(coverImage); 

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        avatarPublicId: avatar.public_id,
        coverImage: coverImage?.url || "",
        coverImagePublicId: coverImage?.public_id || "",
        email,
        password,
        username: username.toLowerCase()
        })
        
        const createUser = await User.findById(user._id).select(
            "-password -refereshToken"
        )
    
    if(!createUser){
        throw new ApiError(400,"something went wrong while creating the user");
    }
    
    return res.status(201).json(
        new ApiResponse(200,createUser,"User registered successfully")
    )
});

const loginUser = asyncHandler(async (req,res) => {
    // res body -> data
    // email or username
    // find the user
    // check password
    // access and refresh token
    // send cookies

    const {email, username, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    const passwordValidation = await user.isPasswordCorrect(password)

    if(!passwordValidation){
        throw new ApiError(401,"Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
         httpOnly: true,
         secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    } 

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorize request")
    }
    
    try {
         const decodedToken = verifyJWT(
            incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
         )
    
         const user = User.findById(decodedToken?._id)
    
         if(!user){
            throw new ApiError(401,"Invalid refresh token")
         }
    
         if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
         }
    
         const options = {
            httpOnly: true,
            secure:true
         }
    
         const {accessToken ,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
         
         return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken",newRefreshToken, options)
         .json( 
              new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
              )
         )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
            
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(!(newPassword === confirmPassword)){
        throw new ApiError(400, "Passwords do not match")
    } 

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.
    status(200)
    .json(new ApiResponse(200,{}, "Change password successfully"))
})

const getCurrentUser = asyncHandler(async (req,res) => {

    return res.status(200)
    .json(new ApiResponse(200, req.user, "current user has been fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullname, username, email} = req.body

    if(!fullname || !email || !username){
        throw new ApiError(400,"All fields are required")
    }
     
    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            fullname,
            email,
            username
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User has been upadated successfully"))

})

const updateAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    // Fetch the user to get the current avatar's public_id
  const userAvatar = await User.findById(req.user?._id);

  if (userAvatar.avatarPublicId) {
    // Delete the old avatar from Cloudinary
    const oldPublicId = userAvatar.avatarPublicId;
    await cloudinary.uploader.destroy(oldPublicId);
  }

     const avatar = await uploadonCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }


   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            avatar: avatar.url,             // Update the avatar URL
            avatarPublicId: avatar.public_id // Update the public_id
          }
        },
        {
            new: true
        }
    ).select("-password")



    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatart is updated successfully"))
})

const updatecoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"cover image file is missing")
    }

    // Fetch the user to get the current coverImage's public_id
  const userCoverImage = await User.findById(req.user?._id);

  if (userCoverImage.coverImagePublicId) {
    // Delete the old cover image from Cloudinary using the public_id
    await cloudinary.uploader.destroy(userCoverImage.coverImagePublicId);
  }

    const coverImage = await uploadonCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            coverImage: coverImage.url,             // Update the cover image URL
            coverImagePublicId: coverImage.public_id // Update the public_id
          }
        },
        {
            new: true
        }
    ).select("-password")
    
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover image is updated successfully"))
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updatecoverImage  };
