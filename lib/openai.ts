import OpenAI from 'openai';
import { PartnerProfile, MessageType, GeneratedMessages, ApologyReason } from './types';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true,
});

const MODEL = 'llama-3.3-70b-versatile';

const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  good_morning: 'good morning message',
  midday_checkin: 'midday check-in message',
  good_night: 'good night message',
  appreciation: 'appreciation message',
  apology: 'sincere apology',
  romantic: 'romantic message',
  funny: 'funny message',
  anniversary: 'anniversary message',
  birthday: 'birthday message',
  supportive: 'supportive message',
  been_busy: '"I\'ve been busy but I care" message',
  reconnect: 'reconnection message after feeling distant',
  celebration: 'celebration message',
};

const APOLOGY_LABELS: Record<ApologyReason, string> = {
  forgot_something: 'I forgot something important',
  too_busy: 'I have been too busy and neglectful',
  upset_her: 'I upset her during an argument',
  replied_badly: 'I replied badly or harshly',
  calm_situation: 'I want to calm a tense situation',
  take_responsibility: 'I want to take full responsibility for something',
};

function buildSystemPrompt(profile: PartnerProfile): string {
  return `You are a private relationship assistant helping a busy man write thoughtful messages to his ${profile.relationship_type} named ${profile.partner_name}.

Rules:
- Sound natural and human, not like a bot wrote it
- Do not overdo romance unless the message type calls for it
- Avoid clichés and generic phrases
- Keep it believable and authentic
- Never manipulate, guilt-trip, or be dishonest
- Match the partner's communication style

Partner profile:
- Name: ${profile.partner_name}
- Love language: ${profile.love_language || 'not specified'}
- Communication style: ${profile.communication_style || 'warm and natural'}
- Preferred tone: ${profile.preferred_tone}
- Likes: ${profile.likes.length > 0 ? profile.likes.join(', ') : 'not specified'}
- Things to avoid: ${profile.things_to_avoid || 'none'}`;
}

export async function generateMessages(
  profile: PartnerProfile,
  messageType: MessageType,
  customContext?: string
): Promise<GeneratedMessages> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(profile) },
      {
        role: 'user',
        content: `Write a ${MESSAGE_TYPE_LABELS[messageType]} for ${profile.partner_name}.${customContext ? ` Extra context: ${customContext}` : ''}

Return ONLY a JSON object, no markdown, no explanation:
{
  "simple": "short and natural (1-2 sentences)",
  "romantic": "warm and genuine (2-3 sentences)",
  "playful": "light and fun (1-2 sentences)"
}`,
      },
    ],
    temperature: 0.85,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from AI');
  return JSON.parse(content) as GeneratedMessages;
}

export async function generateApology(
  profile: PartnerProfile,
  reason: ApologyReason
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You help a man write a sincere apology to his ${profile.relationship_type} named ${profile.partner_name}. Be honest and genuine. Not dramatic. Not manipulative. 3-4 sentences max.`,
      },
      {
        role: 'user',
        content: `Write an apology. Reason: ${APOLOGY_LABELS[reason]}. Make it sincere and human.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 250,
  });

  return response.choices[0].message.content ?? '';
}

export async function generateReconnectMessage(profile: PartnerProfile): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `Help a man reconnect with his ${profile.relationship_type} ${profile.partner_name} after a period of distance or busyness. Warm, genuine, not overdone.`,
      },
      {
        role: 'user',
        content: 'Write a short reconnection message. Acknowledge the distance, express missing her, suggest making time together. 3 sentences max.',
      },
    ],
    temperature: 0.8,
    max_tokens: 200,
  });

  return response.choices[0].message.content ?? '';
}

export async function generateDateIdeas(
  profile: PartnerProfile,
  budget: string,
  timeAvailable: string,
  isIndoor: boolean,
  withKids: boolean
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `Suggest date night ideas for a man and his ${profile.relationship_type} named ${profile.partner_name}. Her likes: ${profile.likes.join(', ') || 'not specified'}. Love language: ${profile.love_language || 'not specified'}.`,
      },
      {
        role: 'user',
        content: `Suggest 5 practical date ideas. Budget: ${budget}. Time available: ${timeAvailable}. ${isIndoor ? 'Prefer indoor' : 'Prefer outdoor'}. ${withKids ? 'Kid-friendly required' : 'No kids'}.

Return ONLY a JSON object: {"ideas": ["idea 1", "idea 2", "idea 3", "idea 4", "idea 5"]}`,
      },
    ],
    temperature: 0.9,
    max_tokens: 400,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content ?? '{"ideas":[]}';
  const parsed = JSON.parse(content);
  return parsed.ideas ?? [];
}
