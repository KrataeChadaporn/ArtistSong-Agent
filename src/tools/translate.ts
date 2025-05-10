import OpenAI from 'openai';

export const translatPromtThaiToEnglish = async (promt: string): Promise<string> => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_NAME ?? 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are a professional English translator.
              You only translate Thai language into natural and fluent English.
              Do not explain, do not respond in Thai. Just return the English version of the prompt.`
              },
            {
                role: 'user',
                content: promt
            }
        ]
    });

    return response.choices[0].message?.content ?? promt;
}
