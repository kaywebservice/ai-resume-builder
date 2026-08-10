import { NextResponse } from "next/server";
import ollama from "ollama";

const AI_MODEL = "qwen2.5:1.5b";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const prompt = body && typeof body === "object" ? (body as Record<string, unknown>).prompt : undefined;

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "A generation prompt is required." },
        { status: 400 }
      );
    }

    if (prompt.length > 20_000) {
      return NextResponse.json(
        { success: false, error: "The generation prompt is too long." },
        { status: 413 }
      );
    }

    let installedModels: string[] = [];
    try {
      installedModels = (await ollama.list()).models.map((model) => model.name);
    } catch {
      console.error("Ollama is not reachable on 127.0.0.1:11434");
      return NextResponse.json(
        {
          success: false,
          error: "The AI service (Ollama) is not running. Open the Ollama app on your computer, wait for it to show Running, then try again.",
        },
        { status: 503 }
      );
    }

    if (!installedModels.some((name) => name.toLowerCase().startsWith(AI_MODEL.toLowerCase()))) {
      console.error(`Model "${AI_MODEL}" is not installed. Installed: ${installedModels.join(", ") || "(none)"}`);
      return NextResponse.json(
        {
          success: false,
          error: `The AI model "${AI_MODEL}" is not installed. Run "ollama pull ${AI_MODEL}" in a terminal, then try again.`,
        },
        { status: 503 }
      );
    }

    const response = await ollama.chat({
      model: AI_MODEL,
      messages: [
        {
           role: "system",
           content: `
You are an expert ATS resume writer.

Always respond with ONLY a valid JSON object.

Do not explain anything.
Do not use markdown.
Do not wrap the JSON in code blocks.
Do not add any text before or after the JSON.

Return:

{
  "name":"",
  "title":"",
  "summary":"",
  "skills":[""],
  "experience":[
    {
      "company":"",
      "role":"",
      "startDate":"",
      "endDate":"",
      "description":"",
      "accomplishments":[""]
    }
  ],
  "education":[
    {
      "institution":"",
      "degree":"",
      "year":""
    }
  ],
  "certifications":[
    {
      "name":"",
      "issuer":""
    }
  ],
  "achievements":[""],
  "languages":[
    {
      "name":"",
      "proficiency":""
    }
  ],
  "projects":[
    {
      "title":"",
      "description":"",
      "link":""
    }
  ]
}
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      result: response.message.content,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        result: "Generation failed.",
      },
      { status: 500 }
    );
  }
}
