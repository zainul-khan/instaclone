const express = require("express");
const multer = require("multer");
const index_router = express.Router();
const authToken = require("../middleware/auth")
const session_auth = require("../middleware/sessionauth")
const index_controller = require("../controller/indexcontroller");

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype =="image/jpeg"|| file.mimetype == "image/webp"|| file.mimetype == "image/gif"){
            cb(null, "public/images")
        }
        else if(file.mimetype == "video/mp4" || file.mimetype == "video/ogg" || file.mimetype == "video/mkv" || file.mimetype == "video/mpeg" == "video/webm"){
            cb(null, "public/videos")
        }
    },
    filename: (req, file, cb) => {
        const uniqueNum = Date.now() + Math.round(Math.random() * 100); 
        cb(null, uniqueNum + file.originalname);
    }
})

const upload = multer({storage: storage})

index_router.get("/", index_controller.greet);
index_router.get("/home_page", index_controller.home_page)
index_router.get("/sign_up_page", index_controller.sign_up_page);
index_router.get("/all_users", authToken,index_controller.all_users)
index_router.post("/sign_up", upload.single('user_pic'), index_controller.sign_up);
index_router.post("/login", index_controller.login);
index_router.get("/profile", session_auth, index_controller.profile);
index_router.get("/logout" , index_controller.logout)

module.exports = index_router;