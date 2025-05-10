import dotenv from 'dotenv';
import OpenAI from 'openai';
import { MusicAgent } from './src/agent/music-agent';
import { SupportAgent } from './src/agent/support-agent';
import { RecommenderAgent } from './src/agent/recommend-agent';
import { buildHtmlFileAndOpen } from './src/utils/html';

dotenv.config();

const client: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const run = async (userPrompt: string) => {
    // Step 1: ให้ MusicAgent วิเคราะห์ prompt แล้วแนะนำเพลง
    const musicAgent = new MusicAgent(client);
    const { content: musicResponse, embedUrl } = await musicAgent.askQuestion(userPrompt);


    console.log('🔁 Suggesting alternative suggestions...');
    const supportAgent = new SupportAgent(client);
    const supportResponse: string = await supportAgent.optionalSuggestions(musicResponse);

    console.log('🧠 Support the decision...');
    const recommendAgent = new RecommenderAgent(client);
    const recommendResponse: string = await recommendAgent.conclude(musicResponse, supportResponse);

    // สร้าง HTML แสดงผลทั้ง 3 ส่วน
    buildHtmlFileAndOpen(musicResponse, supportResponse, recommendResponse, embedUrl);
};

run("อยากฟังเพลงของ Bodyslam`").then(() => {
    console.log("✅ Done.");
});
