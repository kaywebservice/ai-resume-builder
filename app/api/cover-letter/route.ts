import { NextResponse } from "next/server";
import ollama from "ollama";

const AI_MODEL = "qwen2.5:1.5b";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    const fullName = record.fullName as string | undefined;
    const title = record.jobTitle as string | undefined;
    const jobDescription = record.jobDescription as string | undefined;

    if (!fullName || !title || !jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "fullName, jobTitle and jobDescription are required." },
        { status: 400 }
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

    const prompt = `
Applicant:
  Full Name: ${fullName}
  Professional Title: ${title}
  Email: ${record.email || ""}
  Phone: ${record.phone || ""}
  Location: ${record.location || ""}
  LinkedIn: ${record.linkedin || ""}
  GitHub: ${record.github || ""}
  Website: ${record.website || ""}
  Professional Summary: ${record.summary || ""}
  Work Experience: ${record.experience || ""}
  Skills: ${record.skills || ""}
  Certifications: ${record.certifications || ""}

Target Role / Job Posting:
${jobDescription}

Instructions: Write a concise, professional, tailored cover letter in ${record.language || "English"}.
- Address the hiring manager (use "Dear Hiring Manager," only if no name is available in the posting).
- Lead with a strong opening that shows you want the role described above, then reference 1-2 specific achievements or skills that match the posting.
- Keep it to 4 short paragraphs max (300-400 words).
- Use a confident, professional tone; never fabricate facts.
- End with a polite call to action and a standard sign-off (e.g., "Best regards,").
- Return ONLY a valid JSON object with no markdown, no code fences, no extra text: {"content": "the cover letter text"}.
`;

    const response = await ollama.chat({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert career coach and cover letter writer. Always respond with ONLY a valid JSON object. Do not explain anything. Do not use markdown. Do not wrap the JSON in code blocks. Do not add any text before or after the JSON. If the user requests a cover letter, return: {"content": ""}`,
        },
        {
          role: "user",
          content: prompt.trim(),
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
