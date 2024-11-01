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
router.get('/categoryPage',category_controller.categoryPage)

//** ADD CATEGORY **/
router.get('/add_category',category_controller.load_addCategory)
router.post('/add_category',category_controller.addCategory)

//** EDIT CATEGORY **/
router.get('/edit_category/:id',category_controller.load_editCategory)
router.post('/edit_category/:id',category_controller.editCategory)

//** DELETE CATEGORY **/
router.post('/block_category/:id',category_controller.block_category);
router.post('/unblock_category/:id',category_controller.unblock_category);









module.exports= router;