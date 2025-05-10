import OpenAI from "openai";
import { availableTools, tools } from "../tools/tools";

export class MusicAgent {
    private client: OpenAI;

    private messages = [
        {
            role: 'system',
            content: `
            You are a music agent who recommends songs based on the artist name.
            You can only recommend songs from Spotify.
            Then call "searchSongByArtist" with that name as the argument.
            You must respond with a recommendation in **Thai only**.
            Do not explain or translate anything in English.
        `
        },
    ];

    private currentEmbedUrl: string | null = null;

    constructor(client: OpenAI) {
        this.client = client;
    }

    askQuestion = async (message: string): Promise<{ content: string; embedUrl: string }> => {
        this.messages.push({ role: 'user', content: message });

        const MAX_ITERATIONS = Object.keys(availableTools).length + 1;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            const response = await this.client.chat.completions.create({
                model: process.env.OPENAI_MODEL_NAME ?? 'gpt-4o-mini',
                messages: this.messages as any,
                temperature: 0.5,
                tools: tools as any,
            });

            const { finish_reason, message: aiMessage } = response.choices[0];

            if (finish_reason === 'stop') {
                this.messages.push(aiMessage as any);

                const content = aiMessage.content ?? "ไม่สามารถให้คำตอบได้";

                return {
                    content,
                    embedUrl: this.currentEmbedUrl ?? ""
                };
            }

            if (finish_reason === 'tool_calls') {
                const toolCall = aiMessage.tool_calls![0];
                const functionName = toolCall.function.name;
                const functionToCall = availableTools[functionName];
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const functionArgsArray = Object.values(functionArgs);

                if (functionName === 'translatPromtThaiToEnglish') {
                    functionArgsArray.push(this.client);
                }

                console.log("🛠️ Calling tool:", functionName, "with args", functionArgs);
                const functionResponse = await functionToCall(...functionArgsArray);

                let functionContent: string;

                if (functionName === 'searchSongByArtist') {
                    const song = functionResponse?.[0];
                
                    if (!song) {
                        functionContent = "❌ ไม่พบเพลงจากศิลปินที่ระบุ";
                    } else {
                        this.currentEmbedUrl = song.embedUrl;
                
                        // ดัน message เข้าให้ AI แนะนำจากข้อมูลเพลงนี้
                        const followUpMessage = {
                            role: 'user',
                            content: `เพลงที่เจอ: ${song.name} ของศิลปิน ${song.artist}, ช่วยแนะนำเพลงนี้ในรูปแบบที่เป็นมิตรหน่อย`
                        };
                        this.messages.push(followUpMessage);
                
                        // ตรงนี้เก็บไว้ใช้ในกรณี function-response เฉย ๆ
                        functionContent = `เพลงที่เจอคือ ${song.name} ของ ${song.artist}`;
                    }
                
                
                } else {
                    functionContent = functionResponse;
                }

                this.messages.push({
                    role: 'function',
                    //@ts-ignore
                    name: functionName,
                    content: functionContent,
                });
                

                // แปลไทยแล้วส่งกลับเป็น user message
                if (functionName === 'translatPromtThaiToEnglish') {
                    this.messages.push({
                        role: 'user',
                        content: functionContent, 
                    });
                }
            }

            iterations++;
        }

        return {
            content: "ไม่สามารถแนะนำเพลงได้ ลองพิมพ์ชื่อศิลปินใหม่อีกครั้งนะคะ 🎤",
            embedUrl: ""
        };
    };
}
