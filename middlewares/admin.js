export default function admin(req, res, next) {

    console.log("ROLE:", req.user.role);

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Only admin can create posts"
        });
    }

    next();
}