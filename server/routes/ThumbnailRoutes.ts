import express from "express";
import { generateThumbnail, deleteThumbnail } from "../controllers/ThumbnailController.js";
import { protect } from "../middlewares/auth.js";

const ThumbnailRouter = express.Router();

ThumbnailRouter.post("/generate", protect, generateThumbnail);
ThumbnailRouter.delete("/delete/:id", protect, deleteThumbnail);

export default ThumbnailRouter;