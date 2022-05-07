import multer from "multer";
import mime from "mime";
import {v4 as UUIDv4} from "uuid";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/media");
    },
    filename: (req, file, cb) => {
        cb(null, UUIDv4() + '.' + mime.getExtension(file.mimetype));
    }
})

const upload =multer({ storage: storage });

export default upload