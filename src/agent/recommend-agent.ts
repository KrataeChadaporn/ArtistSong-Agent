import OpenAI from "openai";

export class RecommenderAgent {
    constructor(private readonly client: OpenAI) {} 
    conclude = async (musicResponse: string, optionalRespone: string): Promise<string> => {
        const response = await this.client.chat.completions.create({
            model:  process.env.OPENAI_MODEL_NAME ?? "gpt-4o-mini",
            messages: [
                { 
                    role: 'system', 
                    content: 'You are very knowledgeable about artists all over the world and can recommend more songs from that artist very well, even though you only recommend three songs. ' +
                             'You are very good at making decisions. and respond as the input language.'  
                             
                },
                { role: 'user', content: `the first decision is : ${musicResponse}`  },
                { role: 'user', content: `the first decision is : ${optionalRespone}`  }
            ],
            temperature: 0.5,
        });
        return response.choices[0].message?.content ?? "I support your decision"; 
    };
}