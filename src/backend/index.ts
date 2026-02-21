import { startServer as _startServer, setTelegramConfig } from './server';

export function startServer(port: number) {
  return _startServer(port);
}

export function setUpNotification(config: { telegramBotToken: string; groupId: number; topicId?: number }) {
  setTelegramConfig(config);
}
