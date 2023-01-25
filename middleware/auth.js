const jwt = require('jsonwebtoken');
const user_model = require("../model/user");

const authToken = async (req, res, next) => {
    console.log("inside authToken");
    try {
        // const getToken = req.headers.authorization;
        // const splitToken = getToken.split(' ');

        // if (!getToken) {
        //     return res.status(422).json({ error: 'Token not found' });
        // }
        // // const decodedToken = jwt.verify(JSON.stringify(splitToken), "ThisIsMySecretKey")
        // // console.log(decodedToken)

        // const findUser = await user_model.findOne({
        //     token: splitToken
        // });

        // console.log(findUser)
        // if (!findUser) {
        //     return res.status(422).json({ error: 'Unauthorized User' });
        // }
        // next();
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
            console.log(token)
            //decodes token id
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (!decoded) {
                return res.status(422).json({ error: 'Unauthorized User' });
            }

            req.user = await user_model.findById(decoded._id);
            console.log(req.user = await user_model.findById(decoded._id))
            next();
        }
    } catch (error) {
        return res.status(500).send(error);
    }
}



module.exports = authToken;

