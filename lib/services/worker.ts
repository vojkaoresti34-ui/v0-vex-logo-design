import { JobService } from "./job.service";
import { EmailService } from "./email.service";
import { eventEmitter, APP_EVENTS } from "./events";

export interface BackgroundTask {
  id: string;
  type: "auto_apply" | "bulk_email";
  userId: string;
  status: "queued" | "processing" | "completed" | "failed";
  data?: any;
  error?: string;
  result?: any;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

class WorkerQueue {
  private queue: BackgroundTask[] = [];
  private activeCount = 0;
  private maxConcurrency = 2;
  private taskHistory = new Map<string, BackgroundTask>();

  enqueue(type: "auto_apply" | "bulk_email", userId: string, data?: any): string {
    const id = globalThis.crypto?.randomUUID() || Math.random().toString(36).substring(2);
    const task: BackgroundTask = {
      id,
      type,
      userId,
      status: "queued",
      data,
      createdAt: new Date(),
    };
    this.queue.push(task);
    this.taskHistory.set(id, task);
    
    // Non-blocking trigger of queue processing
    if (typeof setImmediate !== "undefined") {
      setImmediate(() => this.process());
    } else {
      setTimeout(() => this.process(), 0);
    }
    return id;
  }

  getTask(id: string): BackgroundTask | undefined {
    return this.taskHistory.get(id);
  }

  getAllTasks(): BackgroundTask[] {
    return Array.from(this.taskHistory.values());
  }

  private async process() {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    task.status = "processing";
    task.startedAt = new Date();
    this.activeCount++;
    eventEmitter.emit(APP_EVENTS.TASK_UPDATED, task);

    try {
      if (task.type === "auto_apply") {
        const result = await JobService.runAutoApply(task.userId);
        task.result = result;
      } else if (task.type === "bulk_email") {
        const campaignIds = task.data?.campaignIds as string[];
        if (!campaignIds || campaignIds.length === 0) {
          throw new Error("No campaign IDs provided for bulk email outreach");
        }
        
        const results = [];
        for (const id of campaignIds) {
          try {
            const res = await EmailService.sendCampaign(task.userId, id);
            results.push({ id, status: "success", result: res });
          } catch (err: any) {
            results.push({ id, status: "failed", error: err.message || String(err) });
          }
          // Sleep for 1 second between email dispatches to prevent thread blocks and rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        task.result = { results };
      }
      
      task.status = "completed";
    } catch (err: any) {
      task.status = "failed";
      task.error = err.message || String(err);
    } finally {
      task.completedAt = new Date();
      this.activeCount--;
      eventEmitter.emit(APP_EVENTS.TASK_UPDATED, task);
      
      // Process next in queue
      if (typeof setImmediate !== "undefined") {
        setImmediate(() => this.process());
      } else {
        setTimeout(() => this.process(), 0);
      }
    }
  }
}

// Global singleton instance pattern to survive Next.js HMR hot-reload
const globalForWorker = globalThis as unknown as {
  workerQueue: WorkerQueue | undefined;
};

export const workerQueue = globalForWorker.workerQueue ?? new WorkerQueue();

if (process.env.NODE_ENV !== "production") {
  globalForWorker.workerQueue = workerQueue;
}
