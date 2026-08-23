"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { customerSchema } from "@/lib/validations/customer";
import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import type { CustomerActionState } from "@/features/customers/action-state";

const customerIdSchema = z.string().cuid("Invalid customer.");

function getCustomerData(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  };
}

function duplicateEmailMessage(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "P2002"
    ? "A customer with this email already exists."
    : null;
}

export async function saveCustomer(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  await requireRole(["ADMIN", "DISPATCHER"]);

  const idValue = formData.get("id");
  const parsed = customerSchema.safeParse(getCustomerData(formData));
  const id = idValue ? customerIdSchema.safeParse(idValue) : null;

  if (!parsed.success || (idValue && !id?.success)) {
    return {
      error: "Enter valid customer details in every field.",
      success: null,
    };
  }

  try {
    if (id?.success) {
      await prisma.customer.update({
        where: { id: id.data },
        data: parsed.data,
      });
      revalidatePath("/customers");
      return { error: null, success: "Customer updated successfully." };
    }

    await prisma.customer.create({ data: parsed.data });
    revalidatePath("/customers");
    return { error: null, success: "Customer created successfully." };
  } catch (error: unknown) {
    return {
      error:
        duplicateEmailMessage(error) ??
        "The customer could not be saved. Please try again.",
      success: null,
    };
  }
}

export async function deleteCustomer(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  await requireRole(["ADMIN", "DISPATCHER"]);
  const parsedId = customerIdSchema.safeParse(formData.get("id"));

  if (!parsedId.success) {
    return { error: "Invalid customer.", success: null };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: parsedId.data },
    select: { id: true, _count: { select: { workOrders: true } } },
  });

  if (!customer) {
    return { error: "Customer not found.", success: null };
  }

  if (customer._count.workOrders > 0) {
    return {
      error:
        "This customer cannot be deleted because work orders are linked to it.",
      success: null,
    };
  }

  try {
    await prisma.customer.delete({ where: { id: customer.id } });
    revalidatePath("/customers");
    return { error: null, success: "Customer deleted successfully." };
  } catch {
    return {
      error: "The customer could not be deleted. Please try again.",
      success: null,
    };
  }
}
