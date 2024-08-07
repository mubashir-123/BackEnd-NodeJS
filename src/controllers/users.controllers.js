import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../ApiResponse.js";

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

export { registerUser };
