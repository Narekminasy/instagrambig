import multer from "multer";
import mime from "mime";
import { v4 as UUIDv4 } from "uuid";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.resolve("public/media");

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, UUIDv4() + "." + mime.getExtension(file.mimetype));
    }
});

const upload = multer({ storage: storage });

export default upload;
