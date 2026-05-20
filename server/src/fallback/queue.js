// Queue in-process (fallback for SQS)
export class InProcessQueue {
  constructor() {
    this._items = [];
    this._waiting = [];
  }

  async send(msg) {
    if (this._waiting.length) {
      const resolve = this._waiting.shift();
      resolve(msg);
    } else {
      this._items.push(msg);
    }
  }

  async receive() {
    if (this._items.length) return this._items.shift();
    return await new Promise(resolve => this._waiting.push(resolve));
  }
}

export const notificationsQueue = new InProcessQueue();

