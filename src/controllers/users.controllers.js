import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../ApiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
        coverImage: coverImage?.url || "",
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
export { registerUser, loginUser, logoutUser, refreshAccessToken };
