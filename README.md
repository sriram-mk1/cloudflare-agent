# AI Research Agent with Cloudflare and Gemini

An autonomous AI agent that runs on a schedule using Cloudflare Agents to gather daily AI research updates, powered by Google's Gemini model.

## Features

- **Autonomous Operation**: Runs automatically on a cron schedule.
- **Gemini-Powered**: Uses the Gemini 2.0 Flash model for all AI tasks.
- **Daily Briefings**: Delivers daily morning updates (configurable via `agent.config.json`).
- **Comprehensive Research**:
  - Identifies 5 significant research papers.
  - Summarizes the current state of the AI field.
  - Discovers 5 new AI tools and frameworks.
- **Relevance Scoring**: Assesses the relevance of all findings for an AI Engineer.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    Create a `.env` file and add your Google Gemini API key and research topics:
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    RESEARCH_TOPICS=Large Language Models,Generative AI,Reinforcement Learning
    ```

3.  **Configure Schedule**:
    The cron schedule is configured in `wrangler.toml`. By default, it is set to run at 8 AM every day.

4.  **Deploy the Agent**:
    Deploy your agent to Cloudflare using the `wrangler` CLI.
    ```bash
    npx wrangler deploy
    ```

## Obsolete Files

The file `src/index.js` was part of the initial setup and is no longer used. It can be safely deleted.
