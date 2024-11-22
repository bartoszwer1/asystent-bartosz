import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

async function test() {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: "Write me a 20 line of your imaginary story",
                },
            ],
        });

        process.stdout.write(JSON.stringify(completion.choices[0].message.content.trim()));
    } catch (error) {
        console.error('Error:', error);
    }
}
       
test();