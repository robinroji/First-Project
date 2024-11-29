const express = require('express')
const router= express()
const bodyParser = require('body-parser')

//** REQUIRE PATHS  */
const category_controller= require("../controller/catergoryController");
const admin_auth = require('../middleware/admin_auth');

//** MIDDLEWARE */
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}))

//** VIEW ENGINE  **/
router.set('view engine','ejs');
router.set('views','./views/admin');

//** CATEGORY PAGE **/
router.get('/categoryPage',admin_auth.isLogin,category_controller.categoryPage)

//** ADD CATEGORY **/
router.get('/add_category',admin_auth.isLogin,category_controller.load_addCategory)
router.post('/add_category',admin_auth.isLogin,category_controller.addCategory)

//** EDIT CATEGORY **/
router.get('/edit_category/:id',admin_auth.isLogin,category_controller.load_editCategory)
router.post('/edit_category/:id',admin_auth.isLogin,category_controller.editCategory)

//** DELETE CATEGORY **/
router.post('/block_category/:id',admin_auth.isLogin,category_controller.block_category);
router.post('/unblock_category/:id',admin_auth.isLogin,category_controller.unblock_category);

//**** CATEGORY OFFER */

router.get('/loadOffer',admin_auth.isLogin,category_controller.loadOffer)
router.post('/createOffer',admin_auth.isLogin,category_controller.createOffer)

router.post('/applyCoupen',admin_auth.isLogin,category_controller.applyCoupen)
router.post('/delete_offer',admin_auth.isLogin,category_controller.delete_offer)











module.exports= router;