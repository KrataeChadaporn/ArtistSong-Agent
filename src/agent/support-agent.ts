import OpenAI from "openai";

export class SupportAgent{
    constructor(private readonly client: OpenAI) {}
    optionalSuggestions = async (message: string): Promise<string> => {
        const response = await this.client.chat.completions.create({
            model:  process.env.OPENAI_MODEL_NAME ?? "gpt-4o-mini",
            messages: [
                { 
                    role: 'system', 
                    content: 'You are someone who can convey the emotions of the song very well.and respond as the input language.' 
                },
                { role: 'user', content: message }
            ],
            temperature: 0.5,
        });
        return response.choices[0].message.content ?? "I support your decision";
    }
}