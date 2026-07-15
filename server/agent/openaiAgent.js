import { AzureOpenAI } from 'openai';
import { applyCmsAction, listAllAgentSections } from './cmsAgentService.js';
import { isOpenAiConfigured } from './allowedUsers.js';

const APPLY_TOOL = {
  type: 'function',
  function: {
    name: 'apply_cms_action',
    description:
      'Add, update, or delete a site content item after polishing the user text. Call once per user request.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        section: {
          type: 'string',
          enum: ['project', 'project_past', 'committee', 'announcement', 'event'],
          description:
            'project = active projects; project_past = past initiatives; committee = committee members; announcement = home announcements; event = What\'s On / weekly events',
        },
        action: {
          type: 'string',
          enum: ['add', 'update', 'delete'],
        },
        match: {
          type: 'object',
          description: 'For update/delete: identify existing item by id and/or title or name',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
          },
        },
        fields: {
          type: 'object',
          description: 'Polished content fields for add/update',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            content: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            bio: { type: 'string' },
            date: { type: 'string' },
            time: { type: 'string' },
            status: {
              type: 'string',
              enum: ['annual', 'ongoing', 'planning'],
            },
            emoji: { type: 'string' },
            imageUrl: { type: 'string' },
          },
        },
        user_summary: {
          type: 'string',
          description: 'One sentence summary of what you did, for the Teams reply',
        },
      },
      required: ['section', 'action', 'user_summary'],
    },
  },
};

const CLARIFY_TOOL = {
  type: 'function',
  function: {
    name: 'ask_clarification',
    description: 'Ask the user one short question when the request is ambiguous',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        question: { type: 'string' },
      },
      required: ['question'],
    },
  },
};

function buildSystemPrompt() {
  return `You are the Hakaru RSA website content assistant. You update the public website CMS for:
- Projects (section: project) — fields: title, description, status (annual|ongoing|planning), emoji, imageUrl
- Past initiatives (section: project_past) — title, description
- Committee members (section: committee) — name, role, bio, imageUrl
- Announcements on the home page (section: announcement) — title, content, emoji
- What's On events (section: event) — title, date, time, description

Rules:
- Rewrite user text in clear, warm, professional New Zealand English suitable for a community RSA website.
- For destructive actions (delete), only call apply_cms_action when the target item is clear from context and current items list.
- If multiple items could match, call ask_clarification instead.
- If the user only greets or asks how to use the bot, reply briefly without calling tools.
- When an image URL is provided, set imageUrl on fields for project or committee items.
- Use apply_cms_action for all publishes; do not invent JSON outside the tool.`;
}

let openAiClient = null;

function getOpenAiClient() {
  if (openAiClient) return openAiClient;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT?.trim();
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || '2024-10-21';

  openAiClient = new AzureOpenAI({
    endpoint,
    apiKey,
    deployment,
    apiVersion,
  });
  return openAiClient;
}

/**
 * @param {{ userMessage: string, imageUrl?: string, displayName?: string }} input
 * @returns {Promise<{ type: 'success'|'clarify'|'message'|'error', text: string, result?: object }>}
 */
export async function runContentAgent(input) {
  if (!isOpenAiConfigured()) {
    return {
      type: 'error',
      text: 'Azure OpenAI is not configured on the server (AZURE_OPENAI_* env vars).',
    };
  }

  const catalog = await listAllAgentSections();
  const client = getOpenAiClient();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT?.trim();

  const userContent = [
    `User message: ${input.userMessage}`,
    input.imageUrl ? `Attached image URL (already uploaded to site storage): ${input.imageUrl}` : '',
    `Current CMS items (for matching updates/deletes):\n${JSON.stringify(catalog, null, 2)}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: userContent },
  ];

  const response = await client.chat.completions.create({
    model: deployment,
    messages,
    tools: [APPLY_TOOL, CLARIFY_TOOL],
    tool_choice: 'auto',
    temperature: 0.3,
  });

  const choice = response.choices?.[0];
  if (!choice) {
    return { type: 'error', text: 'No response from Azure OpenAI.' };
  }

  if (choice.message?.content && !choice.message?.tool_calls?.length) {
    return { type: 'message', text: choice.message.content.trim() };
  }

  const toolCalls = choice.message?.tool_calls || [];
  for (const call of toolCalls) {
    const fn = call.function;
    if (!fn?.name) continue;
    let args = {};
    try {
      args = JSON.parse(fn.arguments || '{}');
    } catch {
      return { type: 'error', text: 'Could not parse assistant tool arguments.' };
    }

    if (fn.name === 'ask_clarification') {
      return { type: 'clarify', text: args.question || 'Could you clarify which item you mean?' };
    }

    if (fn.name === 'apply_cms_action') {
      try {
        const result = await applyCmsAction({
          section: args.section,
          action: args.action,
          match: args.match || {},
          fields: args.fields || {},
          imageUrl: input.imageUrl || args.fields?.imageUrl,
        });
        const siteBase =
          process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, '') ||
          'https://www.hakarursa.co.nz';
        const pageUrl = `${siteBase}${result.pagePath}`;
        const verb =
          args.action === 'add'
            ? 'Added'
            : args.action === 'update'
              ? 'Updated'
              : 'Removed';
        const text =
          args.user_summary?.trim() ||
          `${verb} **${result.summary}** on ${result.label}. View: ${pageUrl}`;
        return { type: 'success', text, result };
      } catch (err) {
        return {
          type: 'error',
          text: err.message || 'Failed to apply CMS change.',
        };
      }
    }
  }

  if (choice.message?.content) {
    return { type: 'message', text: choice.message.content.trim() };
  }

  return { type: 'error', text: 'I could not process that request.' };
}
