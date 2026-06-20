export class AsyncQueue {
    queue = [];
    isRunning = false;
    push(job) {
        this.queue.push(job);
        if (!this.isRunning) {
            this.run();
        }
    }
    async run() {
        this.isRunning = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            if (job) {
                await job();
            }
        }
        this.isRunning = false;
    }
    async flush() {
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            if (job) {
                await job();
            }
        }
    }
    get length() {
        return this.queue.length;
    }
    get isIdle() {
        return this.queue.length === 0;
    }
}
export class ConcurrentJobQueue {
    queue = [];
    running = 0;
    shuttingDown = false;
    concurrency;
    maxQueueSize;
    retries;
    retryDelay;
    shutdownTimeout;
    constructor(options) {
        this.concurrency = options.concurrency;
        this.maxQueueSize = options.maxQueueSize ?? Infinity;
        this.retries = options.retries ?? 0;
        this.retryDelay = options.retryDelay ?? 0;
        this.shutdownTimeout = options.shutdownTimeout ?? 30000; // default 30s
    }
    enqueue(job) {
        return new Promise((resolve, reject) => {
            if (this.shuttingDown) {
                reject(new Error("Queue is shutting down. No new jobs accepted."));
                return;
            }
            if (this.queue.length >= this.maxQueueSize) {
                reject(new Error("Queue is full. Try again later."));
                return;
            }
            const wrappedJob = async () => {
                try {
                    const result = await this.executeWithRetry(job);
                    resolve(result);
                }
                catch (err) {
                    reject(err);
                }
                finally {
                    this.running--;
                    this.runNext();
                }
            };
            this.queue.push(wrappedJob);
            this.runNext();
        });
    }
    async executeWithRetry(job) {
        let lastError;
        for (let i = 0; i <= this.retries; i++) {
            try {
                return await job();
            }
            catch (err) {
                lastError = err;
                if (i < this.retries) {
                    await new Promise((res) => setTimeout(res, this.retryDelay));
                }
            }
        }
        throw lastError;
    }
    runNext() {
        while (this.running < this.concurrency && this.queue.length > 0) {
            const job = this.queue.shift();
            if (job) {
                this.running++;
                job();
            }
        }
    }
    /** Number of jobs currently running */
    get activeCount() {
        return this.running;
    }
    /** Number of jobs waiting in the queue */
    get pendingCount() {
        return this.queue.length;
    }
    /** Graceful shutdown: wait for all running + queued jobs to finish, with timeout */
    async shutdown() {
        this.shuttingDown = true;
        return new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
                const elapsed = Date.now() - start;
                if (this.running === 0 && this.queue.length === 0) {
                    resolve();
                }
                else if (elapsed >= this.shutdownTimeout) {
                    console.warn(`⚠️ Queue shutdown timeout reached (${this.shutdownTimeout}ms). Forcing exit.`);
                    resolve();
                }
                else {
                    setTimeout(check, 200); // check every 200ms
                }
            };
            check();
        });
    }
}
//# sourceMappingURL=DataQueue.js.map