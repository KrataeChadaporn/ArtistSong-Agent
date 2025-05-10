import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

/**
 * สร้าง HTML และเปิดไฟล์ใน browser โดยอัตโนมัติ
 */
export const buildHtmlFileAndOpen = (
    musicResponse: string,
    supportResponse: string,
    conclusion: string,
    embedUrl: string 
) => {
    const html = generateHtmlTemplate(musicResponse, supportResponse, conclusion, embedUrl);
    const fileName = 'activity_suggestion.html';
    const filePath = path.resolve(fileName);

    fs.writeFile(filePath, html, (err: NodeJS.ErrnoException | null) => {
        if (err) {
            console.error('❌ Error writing HTML file:', err);
            return;
        }

        console.log('✅ HTML file created successfully.');
        openInBrowser(filePath);
    });
};

/**
 * เปิดไฟล์ในเบราว์เซอร์ตามระบบปฏิบัติการ
 */
const openInBrowser = (filePath: string) => {
    const platform = process.platform;
    const command =
        platform === 'win32'
            ? `start "" "${filePath}"`
            : platform === 'darwin'
                ? `open "${filePath}"`
                : `xdg-open "${filePath}"`;

    exec(command, (error) => {
        if (error) {
            console.error(`❌ Error opening file: ${error}`);
        }
    });
};

/**
 * สร้าง HTML สำหรับแสดงผลลัพธ์ พร้อม iframe ของ Spotify
 */
const generateHtmlTemplate = (
    musicResponse: string,
    supportResponse: string,
    conclusionResponse: string,
    embedUrl: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Artist Song Recommender</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(to bottom,rgb(240, 252, 255),rgb(255, 255, 255));
      padding: 2rem;
      color: #4a0057;
    }
    .container {
      max-width: 800px;
      margin: auto;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    h1 {
      text-align: center;
      color:rgb(35, 37, 37);
    }
    section {
      margin-bottom: 1.5rem;
    }
    .title {
      font-weight: bold;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    .content {
      background:rgb(233, 242, 249);
      padding: 1rem;
      border-radius: 8px;
    }
    iframe {
      margin: 1rem 0;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤩 Artist Song Recommender</h1>

    <section>
      <div class="title">🎵 เพลงที่แนะนำ :</div>

    

    <iframe src="${embedUrl}" width="100%" height="352" frameBorder="0" allowfullscreen
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>


      <div class="content">${musicResponse}</div>
    </section>

    <section>
      <div class="title">💡 ความหมายของเพลง:</div>
      <div class="content">${supportResponse}</div>
    </section>

    <section>
      <div class="title">🧠 เพลงที่แนะนำ:</div>
      <div class="content">${conclusionResponse}</div>
    </section>
  </div>
</body>
</html>
`;
