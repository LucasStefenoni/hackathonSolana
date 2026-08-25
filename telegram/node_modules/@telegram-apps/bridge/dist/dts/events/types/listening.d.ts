import { Handler } from 'mitt';
import { EventName, EventPayload, Events } from './index.js';
import { WildcardHandler } from '../createEmitter.js';
export type EventListener<E extends EventName> = Handler<EventPayload<E>>;
export type SubscribeListener = WildcardHandler<Events>;
