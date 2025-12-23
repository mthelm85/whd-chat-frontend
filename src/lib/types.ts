export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type StreamEvent = 
  | { type: 'text'; content: string }
  | { type: 'status'; message: string }
  | { type: 'done'; usage?: { input_tokens: number; output_tokens: number } }
  | { type: 'error'; message: string };

export type StreamCallback = (event: StreamEvent) => void;