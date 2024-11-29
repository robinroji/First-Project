const express = require('express')
const router = express();
const bodyParser = require('body-parser');

//** REQUIRE PATH **/
const admin_auth = require('../middleware/admin_auth');
const user_auth = require('../middleware/auth')
const adminController = require('../controller/adminController');
const admin_customerController = require('../controller/admin_customerController');

//** MIDDLEWARE **/
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));

//** VIEW ENGINE **/
router.set('view engine','ejs');
router.set('views','./views/admin');


//**ADMIN   CONTROLLER **/
router.get('/login',admin_auth.isLogout,adminController.loadLogin)
router.get('/',admin_auth.isLogout, adminController.loadLogin)
router.get('/dashboard',admin_auth.isLogin,adminController.loadDashbord)
router.get('/logout',adminController.logout)

router.post('/login',adminController.login)

//**ADMIN CUSTOMER CONTROLLER **/
router.get('/customer',admin_auth.isLogin,admin_customerController.loadCustomer)

router.post('/customer/block/:id',admin_customerController.customerBlock) 
router.post('/customer/Unblock/:id',admin_auth.isLogin,admin_customerController.customerUnBlock)

//**** Order List *****/

router.get('/orderList',adminController.loadOrderList)
router.get('/edit_order/:id', adminController.editOrder);

//**** Order Detail List  */

router.post('/delete_order/:id',adminController.deleteOrder)
router.post('/updateStatus/:id',adminController.updateStatus)

//****** Coupen ****************/
router.get('/coupen',adminController.getCoupen)
router.get('/load_add_Coupen',adminController.load_add_Coupen)
router.post('/add_Coupen',adminController.add_Coupen)
router.get('/load_edit_Coupen/:id',adminController.load_edit_Coupen)
router.post('/edit_Coupen/:id',adminController.edit_Coupen)
router.post('/delete/:id',adminController.delete_Coupen)

//******  Sales Report */

router.get('/salesReport',adminController.salesReport)
router.get('/sales-report',adminController.sales_report)







module.exports = router;