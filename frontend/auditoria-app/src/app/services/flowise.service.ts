import { Injectable } from '@angular/core';

export interface ChatResponse {
  text: string;
  sessionId?: string;
}

export type StreamCallback = (chunk: string, fullText: string) => void;

@Injectable({ providedIn: 'root' })
export class FlowiseService {
  private readonly flowiseUrl = 'http://localhost:3000';
  private readonly chatflowId = '71147bd8-f0c9-4810-9f9b-416a567e5dfd';

  async sendMessage(
    question: string,
    sessionId?: string,
    onChunk?: StreamCallback
  ): Promise<ChatResponse> {
    const body: Record<string, any> = {
      question,
      streaming: true
    };
    if (sessionId) body['sessionId'] = sessionId;

    const response = await fetch(
      `${this.flowiseUrl}/api/v1/prediction/${this.chatflowId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'text/event-stream',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      throw new Error(`Flowise error: ${response.status}`);
    }

    if (response.body) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';
      let finalSessionId = sessionId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || '';

        for (const eventBlock of events) {
          const parsed = this.parseStreamEvent(eventBlock);
          if (!parsed) continue;

          if (parsed.sessionId) {
            finalSessionId = parsed.sessionId;
          }

          if (parsed.chunk) {
            fullText += parsed.chunk;
            onChunk?.(parsed.chunk, fullText);
          }
        }
      }

      const tail = this.parseStreamEvent(buffer);
      if (tail?.sessionId) finalSessionId = tail.sessionId;
      if (tail?.chunk) fullText += tail.chunk;

      if (fullText) {
        return { text: fullText, sessionId: finalSessionId };
      }
    }

    const data = await response.json();
    return {
      text: data.text || data.answer || data.response || 'Sin respuesta del agente.',
      sessionId: data.sessionId ?? sessionId
    };
  }

  private parseStreamEvent(eventBlock: string): { chunk?: string; sessionId?: string } | null {
    const payload = eventBlock
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trim())
      .join('\n');

    if (!payload || payload === '[DONE]') return null;

    const parsed = this.tryParseJson(payload);
    if (!parsed) return null;

    const sessionId = this.findString(parsed, ['sessionId', 'chatId']);
    const eventName = this.findString(parsed, ['event']);
    const data = parsed.data ?? parsed;

    if (eventName === 'metadata') {
      const metadataSessionId = this.findString(data, ['sessionId', 'chatId']);
      return metadataSessionId ? { sessionId: metadataSessionId } : null;
    }

    if (eventName === 'token') {
      return typeof data === 'string' && data.length > 0 ? { chunk: data, sessionId } : null;
    }

    return null;
  }

  private tryParseJson(value: string): any | null {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private findString(source: any, keys: string[]): string | undefined {
    if (!source || typeof source !== 'object') return undefined;

    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.length > 0) return value;
    }

    return undefined;
  }

  async requestRemediation(context: string, sessionId?: string, onChunk?: StreamCallback): Promise<ChatResponse> {
    const question = [
      'Basándote en la siguiente información de seguridad:',
      '',
      `"${context.substring(0, 500)}"`,
      '',
      'Genera un plan de remediación detallado con pasos concretos, priorizados por severidad.',
      'Incluye los comandos o playbooks necesarios para cada paso.',
      'Usa formato de lista numerada.'
    ].join('\n');

    return this.sendMessage(question, sessionId, onChunk);
  }

  async generateReport(topic: string, sessionId?: string, onChunk?: StreamCallback): Promise<ChatResponse> {
    const question = `Genera un reporte formal de auditoría y cumplimiento sobre: ${topic.substring(0, 200)}. Incluye resumen ejecutivo, hallazgos, riesgos identificados y recomendaciones.`;
    return this.sendMessage(question, sessionId, onChunk);
  }

  formatMarkdown(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="code-block"><code class="lang-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h4 class="mt-4 mb-1 font-semibold text-white">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="mt-5 mb-2 font-bold text-white text-lg">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="mt-6 mb-2 font-bold text-white text-xl">$1</h2>')
      .replace(/^\d+\. (.+)$/gm, '<div class="pl-4 py-0.5">• $1</div>')
      .replace(/^- (.+)$/gm, '<div class="pl-4 py-0.5">• $1</div>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }
}
