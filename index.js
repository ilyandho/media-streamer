const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const app = express();

// Set ejs template engine
app.set("views", path.join(__dirname) + "/views");
app.set("view engine", "ejs");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/video", (req, res) => {
  const _path = path.join(
    "public/videos/Tips_when_reading_the_Qur'an_-_Abu_Bakr_Zoud.mp4"
  );
  fs.stat(_path, (err, stat) => {
    // Handle file not found
    if (err !== null && err.code === "ENOENT") {
      res.sendStatus(404);
    }
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");

      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(_path, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(200, head);
      fs.createReadStream(_path).pipe(res);
    }
  });
});

app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
