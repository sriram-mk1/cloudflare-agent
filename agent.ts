// Environment variables for the Cloudflare Worker
interface Env {
  RESEARCH_API_URL: string;
}

// The main worker module
export default {
  // The fetch handler is required for module workers, but we don't need it to do anything special.
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    return new Response('Scheduler worker is running.');
  },

  // The scheduled handler is our main entry point for the cron trigger.
  async scheduled(controller: any, env: Env, ctx: any): Promise<void> {
    console.log(`Triggering research task at: ${env.RESEARCH_API_URL}`);
    
    try {
      // Make a POST request to our Next.js API route to kick off the AI task.
      // We don't wait for the response ('fire and forget') to keep this worker fast.
      fetch(env.RESEARCH_API_URL, { method: 'POST' });
      console.log('Successfully triggered the research API.');
    } catch (error) {
      console.error('Error triggering research API:', error);
    }
  },
};