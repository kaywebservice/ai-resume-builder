import { NextResponse } from "next/server";
import ollama from "ollama";

const AI_MODEL = "qwen2.5:1.5b";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const resume = payload.resume;

    if (!resume || typeof resume !== "object") {
      return NextResponse.json(
        { success: false, error: "A resume is required for the ATS analysis." },
        { status: 400 }
      );
    }

    const jobDescription = typeof payload.jobDescription === "string" ? payload.jobDescription.trim() : "";
    if (jobDescription.length === 0) {
      return NextResponse.json(
        { success: false, error: "Paste a job description to score the resume against it." },
        { status: 400 }
      );
    }

    if (jobDescription.length > 8_000) {
      return NextResponse.json(
        { success: false, error: "The job description is too long (max 8000 characters)." },
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
You are an expert ATS (Applicant Tracking System) analyst.

Compare the candidate's resume against the job description and score how closely the resume matches the job requirements.

Always respond with ONLY a valid JSON object.

Do not explain anything.
Do not use markdown.
Do not wrap the JSON in code blocks.
Do not add any text before or after the JSON.

Return exactly this structure:

{
  "score": 45,
  "summary": "One short paragraph explaining the overall match.",
  "matchedKeywords": ["react", "typescript"],
  "missingKeywords": ["kubernetes", "graphql"],
  "suggestions": ["Add ...", "Rewrite the summary to ..."]
}

- "score" is an integer from 0 to 100.
- "matchedKeywords" are job-description keywords already covered by the resume.
- "missingKeywords" are important job-description keywords the resume does not mention.
- "suggestions" are 3 to 6 concrete, actionable edits the candidate should make.
`,
        },
        {
          role: "user",
          content: `Job Description:\n${jobDescription}\n\nResume:\n${JSON.stringify(resume)}`,
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
        error: "Generation failed. Please try again.",
      },
      { status: 500 }
    );
  }
}