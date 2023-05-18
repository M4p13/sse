class CircularBuffer{
  private head: number;
  private tail: number;
  private buffer: Array<string>
  private size: number;
  private capacity: number;
  constructor(capacity: number){
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.capacity = capacity;
    this.buffer = Array(capacity);
  }

  enqueue(item: string) {
    if (this.size === this.capacity) {
      this.head = (this.head + 1) % this.capacity;
    }
  
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.size++;
  }

  get lastItem(): string {
    return this.buffer[this.tail - 1];
  }
}

export default CircularBuffer;