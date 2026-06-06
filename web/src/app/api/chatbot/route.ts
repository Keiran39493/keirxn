import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import ngosData from "@/data/ngos.json";
import foundationsData from "@/data/foundations.json";

const MODEL = "claude-sonnet-4-6";

const DONOR_SYSTEM = `You are a warm, knowledgeable charity matching assistant for Liechtenstein's nonprofit network, powered by gemeinnuetzig.li.

Your role is to help donors, philanthropists, and foundations find the right NGO to support. Through natural conversation you learn what they care about, then recommend the best-fit organisations from the directory below.

## NGO Directory (gemeinnuetzig.li)
{ngo_data}

## Conversation approach
1. Greet the user and ask what kind of change or impact they want to create in the world.
2. Ask one or two questions at a time to learn their:
   - Areas of passion (children, environment, health, arts, education, etc.)
   - Geographic preference (Liechtenstein / DACH region / international)
   - Type of support they can give (financial donation, volunteering, partnership, in-kind)
   - Whether they prefer a Verein (association) or Stiftung (foundation)
   - Any SDGs (UN Sustainable Development Goals) they align with
3. Once you have enough context, recommend 2–4 NGOs that are the best fit.
4. For each recommendation explain concisely WHY it matches their expressed interests.
5. Always include the NGO's profile URL from gemeinnuetzig.li.

## Rules
- Only recommend NGOs listed in the directory above. Never invent details.
- If someone asks about donation amounts or legal/tax specifics, direct them to contact the NGO.
- Respond in English by default; switch to German if the user writes in German.
- Keep answers focused and scannable — use bullet points for match reasons.`;

const NGO_SYSTEM = `You are a specialist fundraising advisor helping Liechtenstein nonprofits identify suitable foundations and trusts to approach for funding.

Your role is to help NGO representatives understand which grantmaking foundations from the VLGST network (Vereinigung Liechtensteinischer Gemeinnütziger Stiftungen und Trusts) align with their work and funding needs.

## Foundation Directory (vlgst.li members)
{foundation_data}

## Conversation approach
1. Ask the NGO to describe their organisation: mission, primary activities, and legal form (Verein / Stiftung).
2. Ask one or two follow-up questions to understand:
   - Sector / focus area
   - Geographic scope of their work
   - Type of funding sought (project grant, operational, capital, research)
   - Rough funding range needed
   - Whether they have existing foundation relationships
3. Recommend 2–4 foundations whose mandates align with the NGO's work.
4. For each recommendation explain WHY the foundation is a good fit and whether it accepts unsolicited applications.
5. Give practical tips on how to approach each foundation.
6. Mention the full VLGST member directory at: https://www.vlgst.li/mitgliedschaft/mitglieder

## Rules
- Only reference foundations listed in the directory above.
- Clearly flag when a foundation does NOT accept unsolicited applications (accepts_unsolicited: false).
- Emphasise that funding decisions rest with foundation boards — nothing is guaranteed.
- Respond in English by default; switch to German if the user writes in German.
- Keep advice concrete and actionable.`;

function buildSystemPrompt(mode: string): string {
  if (mode === "ngo") {
    return NGO_SYSTEM.replace(
      "{foundation_data}",
      JSON.stringify(foundationsData.foundations, null, 2)
    );
  }
  return DONOR_SYSTEM.replace(
    "{ngo_data}",
    JSON.stringify(ngosData.ngos, null, 2)
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ detail: "ANTHROPIC_API_KEY is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, mode = "donor" } = await req.json();
  if (!["donor", "ngo"].includes(mode)) {
    return new Response(JSON.stringify({ detail: "Invalid mode." }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(mode);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: `\n\n**Error:** ${msg}` })}\n\n`)
        );
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
