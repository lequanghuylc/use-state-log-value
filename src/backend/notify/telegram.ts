export type TelegramConfig = {
  telegramBotToken: string;
  groupId: number;
  topicId?: number;
};

export async function sendTelegramMessage(config: TelegramConfig, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
  const payload: Record<string, unknown> = {
    chat_id: config.groupId,
    text,
  };
  if (config.topicId) payload.message_thread_id = config.topicId;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Telegram send failed: ${res.status} ${body}`);
  }
}
