import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Interfaces (copied from the original agent)
interface ResearchResult {
  title: string;
  summary: string;
  url: string;
  relevance: number;
}

// This is the main handler for the API route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const gemini = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const researchTopics = process.env.RESEARCH_TOPICS?.split(',') || [];

    console.log("Offloaded AI research task started...");

    // Perform all the research tasks
    const papers = await findResearchPapers(gemini, researchTopics);
    const fieldAnalysis = await analyzeField(gemini, researchTopics);
    const tools = await findNewTools(gemini, researchTopics);

    const topPapers = papers.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
    const topTools = tools.sort((a, b) => b.relevance - a.relevance).slice(0, 5);

    const summary = await summarize(gemini, topPapers, fieldAnalysis, topTools);

    // Log the final summary to the Next.js server console
    console.log("\n========== AI Research Agent Morning Briefing ==========\n");
    console.log(summary);
    console.log("\n======================================================\n");

    res.status(200).json({ message: 'Research task completed successfully.' });

  } catch (error) {
    console.error('Error in research agent API route:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Helper functions (copied and adapted from the original agent)
async function generateAndParse(gemini: GenerativeModel, prompt: string, researchTopics: string[], parser: (text: string) => ResearchResult[]): Promise<ResearchResult[]> {
  try {
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const items = parser(text);
    
    for (const item of items) {
      item.relevance = await assessRelevance(gemini, item.summary, researchTopics);
    }
    return items;
  } catch (error) {
    console.error('Error generating or parsing content:', error);
    return [];
  }
}

async function findResearchPapers(gemini: GenerativeModel, researchTopics: string[]): Promise<ResearchResult[]> {
  const prompt = `Find 5 recent and important research papers on the topics: ${researchTopics.join(', ')}. For each paper, provide title, summary, and URL, separated by '|||'. Each paper should be on a new line.`;
  return generateAndParse(gemini, prompt, researchTopics, (text) =>
    text.split('\n').filter(line => line.trim() !== '').map(paper => {
      const [title, summary, url] = paper.split('|||');
      return { title: title?.trim(), summary: summary?.trim(), url: url?.trim(), relevance: 0 };
    })
  );
}

async function analyzeField(gemini: GenerativeModel, researchTopics: string[]): Promise<string> {
  const prompt = `Provide a summary of the current state of the field in these topics: ${researchTopics.join(', ')}. Include new techniques, methods, and frameworks.`;
  try {
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing field:', error);
    return "Error analyzing field.";
  }
}

async function findNewTools(gemini: GenerativeModel, researchTopics: string[]): Promise<ResearchResult[]> {
  const prompt = `Find 5 new and interesting AI tools relevant to an AI Engineer working on: ${researchTopics.join(', ')}. For each tool, provide name, description, and URL, separated by '|||'. Each tool should be on a new line.`;
  return generateAndParse(gemini, prompt, researchTopics, (text) =>
    text.split('\n').filter(line => line.trim() !== '').map(tool => {
      const [title, summary, url] = tool.split('|||');
      return { title: title?.trim(), summary: summary?.trim(), url: url?.trim(), relevance: 0 };
    })
  );
}

async function assessRelevance(gemini: GenerativeModel, content: string, researchTopics: string[]): Promise<number> {
  const prompt = `As an AI Engineer, on a scale of 1-10, how relevant is the following content to my work on ${researchTopics.join(', ')}? Respond with only a number. Content: ${content}`;
  try {
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const score = parseInt(text.trim());
    return isNaN(score) ? 5 : score;
  } catch (error) {
    console.error('Error assessing relevance:', error);
    return 5; // Default relevance
  }
}

async function summarize(gemini: GenerativeModel, papers: ResearchResult[], fieldAnalysis: string, tools: ResearchResult[]): Promise<string> {
  const prompt = `You are an AI research assistant. Here is your morning briefing for an AI Engineer.\n\n**Top 5 Research Papers:**\n${papers.map(p => `- ${p.title}: ${p.summary} (${p.url})`).join('\n')}\n\n**Field Analysis:**\n${fieldAnalysis}\n\n**Top 5 New AI Tools:**\n${tools.map(t => `- ${t.title}: ${t.summary} (${t.url})`).join('\n')}\n\nPlease provide a concise summary of this information.`;
  try {
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error summarizing content:', error);
    return "Error generating summary.";
  }
}
