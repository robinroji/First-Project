const isLogin = async (req, res, next) => {
    try {
        if (req.session.admin) {
          console.log('admin session is there');
          
        } else {
            res.redirect('/admin');
        }
        next();
    } catch (error) {
        console.log(error.message);
    
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.admin) {
            console.log('logged admin homepage redirected to admin/home itself');
            res.redirect('/admin/dashboard');
        }
        else{
            next();

        }
        
    } catch (error) {
        console.log('hi');
    }
};

module.exports = {
    isLogin,
    isLogout
};
     