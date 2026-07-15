import axios from 'axios';
import {
  ActivityTypes,
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  MessageFactory,
  TeamsActivityHandler,
} from 'botbuilder';
import { MicrosoftAppCredentials } from 'botframework-connector';
import { uploadCmsImage } from '../cmsService.js';
import { insertCmsAgentAudit } from '../db.js';
import { runContentAgent } from './openaiAgent.js';
import {
  isAgentConfigured,
  isAgentUserAllowed,
  isOpenAiConfigured,
} from './allowedUsers.js';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

function isRateLimited(userId) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  rateLimitMap.set(userId, entry);
  return entry.count > RATE_LIMIT_MAX;
}

function getTeamsIdentity(context) {
  const from = context.activity.from || {};
  const channelData = context.activity.channelData || {};
  const tenant = channelData.tenant?.id || channelData.tenantId;
  return {
    aadObjectId: from.aadObjectId || from.id,
    tenantId: tenant,
    displayName: from.name,
  };
}

async function downloadTeamsAttachment(attachment) {
  const appId = process.env.MICROSOFT_APP_ID?.trim();
  const appPassword = process.env.MICROSOFT_APP_PASSWORD?.trim();
  if (!appId || !appPassword || !attachment?.contentUrl) {
    return null;
  }
  const credentials = new MicrosoftAppCredentials(appId, appPassword);
  const token = await credentials.getToken();
  const res = await axios.get(attachment.contentUrl, {
    responseType: 'arraybuffer',
    headers: { Authorization: `Bearer ${token}` },
    maxContentLength: 10 * 1024 * 1024,
  });
  return Buffer.from(res.data);
}

async function extractImageUrl(context) {
  const attachments = context.activity.attachments || [];
  for (const att of attachments) {
    const contentType = (att.contentType || '').toLowerCase();
    if (!contentType.startsWith('image/')) continue;
    try {
      const buffer = await downloadTeamsAttachment(att);
      if (!buffer?.length) continue;
      const { publicUrl } = await uploadCmsImage(buffer);
      return publicUrl;
    } catch (err) {
      console.warn('Teams image download/upload failed:', err.message || err);
    }
  }
  return null;
}

class HakaruContentAgentBot extends TeamsActivityHandler {
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      try {
        await this.handleUserMessage(context);
      } catch (err) {
        console.error('Teams agent error:', err);
        await context.sendActivity(
          MessageFactory.text(
            'Something went wrong processing your request. Please try again or use Admin Site Content.',
          ),
        );
      }
      await next();
    });
  }

  async handleUserMessage(context) {
    if (context.activity.type !== ActivityTypes.Message) return;

    const identity = getTeamsIdentity(context);
    const allowed = await isAgentUserAllowed(identity);
    if (!allowed) {
      await context.sendActivity(
        MessageFactory.text(
          'You are not authorized to update the Hakaru RSA website. Contact an administrator to be added to the content agent allowlist.',
        ),
      );
      return;
    }

    if (isRateLimited(identity.aadObjectId || 'unknown')) {
      await context.sendActivity(
        MessageFactory.text('Too many requests — please wait a minute and try again.'),
      );
      return;
    }

    if (!isOpenAiConfigured()) {
      await context.sendActivity(
        MessageFactory.text('The content agent is not fully configured (Azure OpenAI).'),
      );
      return;
    }

    const rawText = (context.activity.text || '').trim();
    const imageUrl = await extractImageUrl(context);
    const userMessage =
      rawText ||
      (imageUrl
        ? 'Please add or update site content using the attached image and any details you can infer.'
        : '');

    if (!userMessage && !imageUrl) {
      await context.sendActivity(
        MessageFactory.text(
          'Send a message describing what to add or change on the website. You can attach an image for projects or committee photos.\n\nExamples:\n• Add project: Memorial garden upgrade — ongoing initiative…\n• New announcement: Poppy Day volunteers needed…\n• Update event: Sunday roast now 12–3pm\n• Remove announcement about pool tournament',
        ),
      );
      return;
    }

    await context.sendActivity(MessageFactory.text('Working on that…'));

    const outcome = await runContentAgent({
      userMessage,
      imageUrl: imageUrl || undefined,
      displayName: identity.displayName,
    });

    await context.sendActivity(MessageFactory.text(outcome.text));

    if (outcome.type === 'success' && outcome.result) {
      await insertCmsAgentAudit({
        channel: 'teams',
        actorAadObjectId: identity.aadObjectId,
        actorName: identity.displayName,
        action: outcome.result.action,
        section: outcome.result.section,
        slug: outcome.result.slug,
        itemSummary: outcome.result.summary,
        payloadJson: JSON.stringify({
          item: outcome.result.item,
          pagePath: outcome.result.pagePath,
        }),
      });
    }
  }
}

let adapter = null;
let bot = null;

export function isTeamsBotConfigured() {
  return isAgentConfigured();
}

export function getTeamsBotAdapter() {
  if (adapter) return adapter;
  const auth = new ConfigurationBotFrameworkAuthentication({
    MicrosoftAppId: process.env.MICROSOFT_APP_ID,
    MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
    MicrosoftAppType: 'MultiTenant',
  });
  adapter = new CloudAdapter(auth);
  adapter.onTurnError = async (context, error) => {
    console.error('Bot turn error:', error);
    await context.sendActivity('The bot encountered an error.');
  };
  bot = new HakaruContentAgentBot();
  return adapter;
}

export function getTeamsBot() {
  if (!bot) getTeamsBotAdapter();
  return bot;
}

/**
 * Express handler for POST /api/messaging
 */
export function teamsMessagingHandler(req, res) {
  if (!isTeamsBotConfigured()) {
    return res.status(503).json({ error: 'Teams bot is not configured' });
  }
  const botAdapter = getTeamsBotAdapter();
  const agentBot = getTeamsBot();
  botAdapter.process(req, res, async (context) => {
    await agentBot.run(context);
  });
}
