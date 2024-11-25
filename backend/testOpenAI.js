import OpenAI from "openai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

function encodeImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Błąd podczas czytania plików obrazu', error);
    process.exit(1);
  }
}

const imagePath = 'prompt_images/pht3.jpg'

const base64Image = encodeImage(imagePath);

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Co jest na zdjęciu?"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });
      
      console.log(completion.choices[0].message);

      // process.stdout.write(JSON.stringify(completion.choices[0].message.content.trim()));
  } catch (error) {
    if (error.response) {
      console.error('Błąd API OpenAI:', error.response.status, error.response.data);
    } else {
      console.error('Błąd:', error.message);
    }
  }
}
       
test();