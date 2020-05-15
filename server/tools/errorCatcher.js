const errorCatcher = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        res.status(400).json({success: false, error: error.message})
    }
};


module.exports = errorCatcher;
