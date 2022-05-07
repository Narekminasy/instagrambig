import HttpError from "http-errors";

export default {
    notFound(req, res, next) {
        next(new HttpError("Not Found", 404));
    },
    errors(err, req, res, next) {
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors ? err.errors : {},
        })
    },
}