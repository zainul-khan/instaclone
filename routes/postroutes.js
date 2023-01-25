const express = require("express");
const post_router = express.Router();
const multer = require("multer");
const post_controller = require("../controller/postcontroller");
const authToken = require("../middleware/auth");
const session_auth = require("../middleware/sessionauth");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/webp" || file.mimetype == "image/gif") {
            cb(null, "public/images")
        }
        else if (file.mimetype == "video/mp4" || file.mimetype == "video/ogg" || file.mimetype == "video/mkv" || file.mimetype == "video/mpeg" == "video/webm") {
            cb(null, "public/videos")
        }
    },
    filename: function (req, file, cb) {
        const uniqueNum = Date.now() + Math.round(Math.random() * 100);
        cb(null, uniqueNum + file.originalname);
    }
})

const upload = multer({ storage: storage })

//******************FETCH POST DATA***************** */
post_router.get("/hit_post", post_controller.hit_post) //done
post_router.get("/fetch_all_posts", post_controller.fetch_all_posts); //done
post_router.get("/fetch_post_likes", post_controller.fetch_post_likes);
post_router.get("/fetch_post_comment",session_auth, post_controller.fetch_post_comment); //comments done one  a single post // done
post_router.get("/fetch_post_data",session_auth, post_controller.fetch_post_data);
post_router.get("/fetch_create_post_page", session_auth, post_controller.fetch_create_post_page)
post_router.get("/render_edit_comment" , session_auth,  post_controller.render_edit_comment)

//******************CREATE POST DATA***************** */
post_router.post("/create_post", [upload.single("post"), authToken], post_controller.create_post);  //done
post_router.get("/create_like", authToken, post_controller.create_like); //done ******************************************************************************
post_router.post("/create_comment", session_auth, authToken, post_controller.create_comment); //done
post_router.patch("/edit_comment", authToken, post_controller.edit_comment);

/*********************DELETE POST DATA*************** */
post_router.delete("/delete_post/:id", authToken, post_controller.delete_post)
post_router.delete("/delete_comment/:id/:post_id", authToken, post_controller.delete_comment)

module.exports = post_router;