require("dotenv").config()

const cloudinary = require("cloudinary").v2;
const { Router } = require("express")
const { registerUser, registerAdmin, updateProfileInfo, fetchActionFeedInfo, toggleWarnUserPut } = require("../controllers/indexController")
const { getUserToken, getAdminToken, checkLoginStatus, authenticateUser } = require("../auth/jwtauth");
const { OnlyPOSTReq } = require("../middlewares/methodValidator");
const { PrismaClient }  = require("@prisma/client");
const prisma = new PrismaClient();
const streamifier = require("streamifier");

const multer = require("multer")
const upload = multer()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const indexRouter = Router()

//  user routes
indexRouter.post(
                    "/user/auth/register",
                    registerUser
                )

indexRouter.post(
                    "/user/auth/login",
                    getUserToken
                );

//  admin routes

indexRouter.post(
                "/admin/auth/register",
                OnlyPOSTReq,
                registerAdmin
                )

indexRouter.post(
                "/admin/auth/login",
                OnlyPOSTReq,
                getAdminToken
                )


indexRouter.get(
        "/auth",
        checkLoginStatus
    )


indexRouter.post("/user/user-profile", authenticateUser, upload.single("profilePic"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const theUser = await prisma.users.findFirst({
        where: { users_id: req.user.users_id }
    });
    if (theUser.profilePic) {
        const { public_id } = JSON.parse(theUser.profilePic);
        await cloudinary.uploader.destroy(public_id);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "user_profiles" },
        async (error, cloudResult) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }

        try {
            const imgData = JSON.stringify(cloudResult);
  
            await prisma.users.update({
              where: { users_id: req.user.users_id },
              data: { profilePic: imgData },
            });
  
            return res.status(201).json({
              success: true,
              message: "Avatar uploaded successfully!",
              imageUrl: cloudResult.secure_url,
            });
          } catch (e) {
            console.error("Error saving to DB:", e);
            return res.status(500).json({ success: false, message: "Upload failed while saving to DB." });
          }
        }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream)

});


indexRouter.put("/user/user-profile/:userId", authenticateUser, updateProfileInfo);

indexRouter.get("/user/user-profile/action-feeds", authenticateUser, fetchActionFeedInfo)

indexRouter.put("/user/:userId", authenticateUser, toggleWarnUserPut)


module.exports = indexRouter

