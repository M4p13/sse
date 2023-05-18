import {EventEmitter} from 'node:events';
import CircularBuffer from './CirculaBuffer';

interface ServerEventEmitter {
  trigger: string;
  emitter: EventEmitter;
  notify(): void;
}

function createServerEventEmitter(trigger:string): ServerEventEmitter {
  return new class implements ServerEventEmitter {
    trigger = trigger;
    emitter = new EventEmitter();
    notify(){
      this.emitter.emit(trigger);
    }
  }
}


class EmittingServer {
  private eventEmitters: ServerEventEmitter[];
  private messageBuffer: CircularBuffer;
  private createEmitter: ()=>ServerEventEmitter;
  constructor(trigger:string){
    this.messageBuffer = new CircularBuffer(100);
    this.eventEmitters = [];
    this.createEmitter = () => createServerEventEmitter(trigger);
  }

  makeStream(){
    const sse = this.createEmitter();
    this.addEventEmitter(sse);
    return createStream(sse, this);
  }
  

  addEventEmitter(eventEmitter: ServerEventEmitter){
    this.eventEmitters.push(eventEmitter);
  }

  removeEventEmitter(eventEmitter: ServerEventEmitter){
    this.eventEmitters = this.eventEmitters.filter((emitter) => {
      return emitter !== eventEmitter;
    });
  }

  get latestMessage(): string {
    return this.messageBuffer.lastItem;
  }

  broadcast(message: string){
    this.messageBuffer.enqueue(message);
    this.eventEmitters.forEach((eventEmitter) => {
      eventEmitter.notify();
    });
  }

}

function createStream(sse: ServerEventEmitter, server: EmittingServer){
  const stream = new ReadableStream({
    start(controller){
      const listener = () => {
        controller.enqueue("data: " + server.latestMessage + "\n\n");

      }
      sse.emitter.on(sse.trigger, listener);
    },
    cancel(){
      sse.emitter.removeAllListeners(sse.trigger);
      server.removeEventEmitter(sse);
    }
  })
  return stream;
}