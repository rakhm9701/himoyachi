export enum CommandType {
  SHUTDOWN = 'shutdown',
  RESTART = 'restart',
  LOCK = 'lock',
}

export enum CommandStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
}