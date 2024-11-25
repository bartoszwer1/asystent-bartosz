import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

async function test() {
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: "Vector logo design for AI assistant named 'bartosz.', minimalistic, white background, black and navy accent ",
            n: 1,
            quality: "hd",
            size: "1024x1024",
          });

          console.log("\n\n\n")
          console.log(response.data[0].url);
          console.log("\n\n\n")

    } catch (error) {
        console.error('Error:', error);
    }
}
       
test();