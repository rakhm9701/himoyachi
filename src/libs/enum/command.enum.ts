export enum CommandType {
  SHUTDOWN = 'shutdown',
  RESTART = 'restart',
  LOCK = 'lock',
  SCREENSHOT = 'screenshot',
}

export enum CommandStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
}
