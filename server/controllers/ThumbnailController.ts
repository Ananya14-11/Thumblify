import {Request, Response} from 'express';
import Thumbnail from '../models/Thumbnail.js';
import ai from '../configs/ai.js';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const stylePrompts={
  'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
  'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
  'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
  'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
  'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
}

const colorSchemeDescriptions={
    vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
}

export const generateThumbnail = async (req: Request, res: Response) => {
    try {
        // 1. Get the standard data from the frontend body
        const { title, style, aspect_ratio, color_scheme } = req.body;

        // 2. Safely grab the userId wherever the 'protect' middleware hid it!
        const userId = (req.session as any)?.userId;
        // Add a quick safety check
        if (!userId) {
            return res.status(401).json({ success: false, message: "Session expired or User ID not found" });
        }

        // 3. Set dimensions...
        let width = 1280;
        let height = 720;
        if (aspect_ratio === '1:1') { width = 1080; height = 1080; } 
        else if (aspect_ratio === '9:16') { width = 720; height = 1280; }

        // 4. Construct URL
        // Use .trim() to remove accidental leading/trailing spaces
const prompt = `A high quality YouTube thumbnail for a video titled "${title.trim()}". The style is ${style}. The color scheme is ${color_scheme}. No text in the image.`;

// encodeURIComponent is the key—it converts spaces to %20 and handles special characters
const encodedPrompt = encodeURIComponent(prompt);

// Use the Flux model endpoint which is more reliable for dev projects
const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 10000)}&model=flux`;

        // 5. Create the database entry WITH the safely grabbed userId
        const thumbnail = await Thumbnail.create({
            userId: userId, 
            title,
            style,
            aspect_ratio,
            color_scheme,
            image_url: imageUrl, 
            isGenerating: false
        });

        // 6. Send success response
        res.status(200).json({
            success: true,
            message: "Thumbnail generated successfully!",
            thumbnail: thumbnail
        });

    } catch (error) {
        console.error("Generation error:", error);
        res.status(500).json({ success: false, message: "Failed to generate thumbnail" });
    }
};
//Controllers For Thumbnail Deletion
export const deleteThumbnail= async(req: Request, res:Response)=>{
   try {
    const {id}=req.params;
    const {userId}=req.session;
    await Thumbnail.findByIdAndDelete({_id: id, userId});

    res.json({message:'Thumbnail deleted successfully'})
   } catch (error:any) {
      console.log(error);
      res.status(500).json({message: error.message});
   }
}