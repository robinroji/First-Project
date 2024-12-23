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
// router.get('/dashboardFilter',admin_auth.isLogin,adminController.dashboardFilter)
router.get('/logout',adminController.logout)

router.post('/login',admin_auth.isLogout,adminController.login)

//**ADMIN CUSTOMER CONTROLLER **/
router.get('/customer',admin_auth.isLogin,admin_customerController.loadCustomer)

router.post('/customer/block/:id',admin_customerController.customerBlock) 
router.post('/customer/Unblock/:id',admin_auth.isLogin,admin_customerController.customerUnBlock)

//**** Order List *****/

router.get('/orderList',admin_auth.isLogin,adminController.loadOrderList)
router.get('/edit_order/:id',admin_auth.isLogin, adminController.editOrder);

//**** Order Detail List  */

router.post('/delete_order/:id,admin_auth.isLogin',adminController.deleteOrder)
router.post('/updateStatus/:id',admin_auth.isLogin,adminController.updateStatus)

//****** Coupen ****************/
router.get('/coupen',admin_auth.isLogin,adminController.getCoupen)
router.get('/load_add_Coupen',admin_auth.isLogin,adminController.load_add_Coupen)
router.post('/add_Coupen',admin_auth.isLogin,adminController.add_Coupen)
router.get('/load_edit_Coupen/:id',admin_auth.isLogin,adminController.load_edit_Coupen)
router.post('/edit_Coupen/:id',admin_auth.isLogin,adminController.edit_Coupen)
router.post('/delete/:id',admin_auth.isLogin,adminController.delete_Coupen)

//******  Sales Report */

router.get('/salesReport',admin_auth.isLogin,adminController.salesReport)
router.get('/sales-report',admin_auth.isLogin,adminController.sales_report_filter)

//**** download sales Report */

router.get('/sales-report/download/pdf',admin_auth.isLogin,adminController.pdf)
router.get('/sales-report/download/excel',admin_auth.isLogin,adminController.excel)

//****** Chart data ****************/
router.get('/getChartData',admin_auth.isLogin,adminController.chartData)








module.exports = router;