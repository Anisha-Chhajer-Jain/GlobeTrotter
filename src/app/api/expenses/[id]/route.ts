import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { updateExpenseSchema } from "@/lib/validations";

async function loadExpenseWithAccess(id: string, userId: string) {
  const expense = await prisma.expense.findUnique({ where: { id }, include: { trip: true } });
  if (!expense) throw new AppError("Expense not found", 404);
  if (expense.userId !== userId && expense.trip.userId !== userId) {
    throw new AppError("Permission denied", 403);
  }
  return expense;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    await loadExpenseWithAccess(id, user.id);

    const body = await req.json();
    const data = updateExpenseSchema.parse(body);

    const updated = await prisma.expense.update({
      where: { id },
      data: { ...data, amount: data.amount as any },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return jsonResponse({ expense: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    await loadExpenseWithAccess(id, user.id);

    await prisma.expense.delete({ where: { id } });
    return jsonResponse({ message: "Expense deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
