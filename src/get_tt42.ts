import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: "Please output the FULL text in Vietnamese of 'Thông tư 42/2022/TT-BCT quy định về kiểm tra hoạt động điện lực và sử dụng điện, giải quyết tranh chấp hợp đồng mua bán điện' exactly as the legal document states it. Format it in Markdown with '## Chương X', '### Mục Y', '### Điều Z. Title'. Omit any commentary, just output the raw markdown."
  });
  fs.writeFileSync("src/data/raw_tt42.txt", response.text || "");
  console.log("Generated TT42, length:", response.text?.length);
}
run();
