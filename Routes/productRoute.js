const express = require ('express');
const route = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');


//**  REQUIRE PATHS **/
const product_controller = require('../controller/productController');
const admin_auth= require('../middleware/admin_auth')


//** VIEW ENGINE  **/
route.set('view engine','ejs');
route.set('views','./views/admin');

//**  MIDDLEWARE   **/
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({extended:true}));
route.use(express.static('public'));



    //**  MULTER  **/
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '../public/newfile'));
        },

        filename: function (req, file, cb) {
            const name = Date.now() + '-' + file.originalname;
            cb(null, name);
        }
    });

    const upload = multer({ storage: storage });





//**  PRODUCT PAGE  **//
route.get('/productPage',admin_auth.isLogin, product_controller.productPage)

//**  ADD PRODUCT **//
route.get('/add_product',admin_auth.isLogin,product_controller.load_product)
route.post('/add_product',admin_auth.isLogin,upload.array('pro_images'),product_controller.addProduct)

//**  EDIT PRODUCT  **//
route.get('/edit_product/:id',admin_auth.isLogin,product_controller. load_edit_page)
route.post('/edit_product/:id',admin_auth.isLogin,upload.array('pro_images'),product_controller.update_product)

//**  DELETE PRODUCT **//
route.post('/activate/:id',admin_auth.isLogin,product_controller.active_product)
route.post('/deactivate/:id',admin_auth.isLogin,product_controller.deactive_product)

//** Delete image */
route.delete('/img_delete',product_controller.img_delete)

//****   Product Offer */
route.get('/load_productOffer',admin_auth.isLogin,product_controller.load_productOffer)
route.post('/productOffer',admin_auth.isLogin,product_controller.productOffer)

route.post('/applyProducOffer',admin_auth.isLogin,product_controller.applyProducOffer)
route.post('/removeOffer',admin_auth.isLogin,product_controller.removeOffer)

//*** ************ RETURN PRODUCT PAGE ************/

route.get('/returnProducts',admin_auth.isLogin,product_controller.returnProducts)
route.post('/acceptReturn',admin_auth.isLogin,product_controller.acceptReturn)
route.post('/rejectOrder',admin_auth.isLogin,product_controller.rejectOrder)




module.exports = route;




