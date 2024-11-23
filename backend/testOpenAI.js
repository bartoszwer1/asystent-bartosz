import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

async function test() {
    try {
        const completion = await openai.chat.completions.create({
            model: "o1-mini",
            messages: [
              {
                "role": "user",
                "content": [
                  {
                    "type": "text",
                    "text": "Wytłumacz mi dlaczego warto używać nowszych termometrów, niż tych rtęciowych?"
                  }
                ]
              }
            ]
        });

        console.log(completion.choices[0].message.content);

        // process.stdout.write(JSON.stringify(completion.choices[0].message.content.trim()));
    } catch (error) {
        console.error('Error:', error);
    }
}
       
test();