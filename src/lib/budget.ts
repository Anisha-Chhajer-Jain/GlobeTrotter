import type { Trip, TripStop, TripActivity, Expense, Activity } from "@prisma/client";

export interface TripWithDetails extends Trip {
  stops: Array<TripStop & {
    city: {
      id: string;
      name: string;
      country: string;
      imageUrl: string | null;
    };
    activities: Array<TripActivity & {
      activity: Activity;
    }>;
  }>;
  expenses: Expense[];
}

export interface BudgetBreakdown {
  totalBudget: number;
  totalSpent: number;
  totalEstimated: number;
  remaining: number;
  currency: string;
  byCategory: Record<string, number>;
  byCity: Record<string, number>;
  byDay: Record<string, number>;
}

export function calculateTripBudget(trip: TripWithDetails): BudgetBreakdown {
  const totalBudget = Number(trip.budget || 0);
  let totalSpent = 0;
  let totalEstimated = 0;

  const byCategory: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  for (const expense of trip.expenses) {
    const amount = Number(expense.amount || 0);
    totalSpent += amount;
    byCategory[expense.category] = (byCategory[expense.category] || 0) + amount;
    const dayKey = expense.date ? expense.date.toISOString().split("T")[0] : "unscheduled";
    byDay[dayKey] = (byDay[dayKey] || 0) + amount;
  }

  for (const stop of trip.stops) {
    let cityTotal = 0;
    for (const ta of stop.activities) {
      const cost = Number(ta.actualCost ?? ta.activity.cost ?? 0);
      totalEstimated += cost;
      cityTotal += cost;
    }
    byCity[stop.city.name] = cityTotal;
  }

  return {
    totalBudget,
    totalSpent,
    totalEstimated,
    remaining: totalBudget - (totalSpent + totalEstimated),
    currency: trip.currency,
    byCategory,
    byCity,
    byDay,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
