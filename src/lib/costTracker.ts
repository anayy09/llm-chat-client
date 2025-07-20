// src/lib/costTracker.ts
interface CostData {
  model: string;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  timestamp: number;
}

class CostTracker {
  private costs: CostData[] = [];
  private readonly STORAGE_KEY = 'llm-chat-costs';

  constructor() {
    this.loadFromStorage();
  }

  addCost(data: CostData) {
    this.costs.push(data);
    this.saveToStorage();
  }

  getTotalCost(): number {
    return this.costs.reduce((sum, cost) => sum + cost.cost, 0);
  }

  getTodayCost(): number {
    const today = new Date().toDateString();
    return this.costs
      .filter(cost => new Date(cost.timestamp).toDateString() === today)
      .reduce((sum, cost) => sum + cost.cost, 0);
  }

  getCostByModel(model: string): number {
    return this.costs
      .filter(cost => cost.model === model)
      .reduce((sum, cost) => sum + cost.cost, 0);
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.costs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load cost data:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.costs));
    } catch (error) {
      console.error('Failed to save cost data:', error);
    }
  }
}

export const costTracker = new CostTracker();