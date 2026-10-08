"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAccount } from "@/lib/guest";
import { requireTeamOwner } from "@/lib/teams";
import {
  generateJoinCode,
  normalizeJoinCode,
  type TeamKind,
} from "@/lib/team-rules";

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Algo salió mal";
}

function isUniqueViolation(e: unknown) {
  return (
    typeof e === "object" && e !== null && "code" in e && e.code === "P2002"
  );
}

async function uniqueJoinCode() {
  for (let i = 0; i < 8; i++) {
    const code = generateJoinCode();
    const clash = await prisma.team.findUnique({ where: { joinCode: code } });
    if (!clash) return code;
  }
  throw new Error("No se pudo generar un código. Inténtalo de nuevo.");
}

export async function createTeam(formData: FormData) {
  try {
    const profile = await requireAccount();
    const name = String(formData.get("name") || "").trim();
    const kind: TeamKind = formData.get("kind") === "BOX" ? "BOX" : "COACH";
    const description = String(formData.get("description") || "").trim() || null;
    if (name.length < 2) return { error: "Escribe un nombre" };

    const team = await prisma.team.create({
      data: {
        name,
        kind,
        description,
        ownerId: profile.id,
        joinCode: await uniqueJoinCode(),
      },
    });
    revalidatePath("/", "layout");
    return { message: `${team.name} creado`, redirectTo: `/coach/${team.id}` };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function updateTeam(formData: FormData) {
  const teamId = String(formData.get("teamId") || "");
  try {
    await requireTeamOwner(teamId);
    const name = String(formData.get("name") || "").trim();
    if (name.length < 2) return { error: "Escribe un nombre" };
    await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        description: String(formData.get("description") || "").trim() || null,
      },
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/coach/${teamId}`, "layout");
  return { ok: true };
}

export async function regenerateJoinCode(formData: FormData) {
  const teamId = String(formData.get("teamId") || "");
  try {
    await requireTeamOwner(teamId);
    await prisma.team.update({
      where: { id: teamId },
      data: { joinCode: await uniqueJoinCode() },
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/coach/${teamId}/members`);
  return { ok: true };
}

export async function joinTeam(formData: FormData) {
  try {
    const profile = await requireAccount();
    const code = normalizeJoinCode(String(formData.get("code") || ""));
    if (code.length < 4) return { error: "Código inválido" };

    const team = await prisma.team.findUnique({ where: { joinCode: code } });
    if (!team) return { error: "No existe ningún box o coach con ese código" };
    if (team.ownerId === profile.id) {
      return { error: "Ya eres el dueño de este equipo" };
    }

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_profileId: { teamId: team.id, profileId: profile.id } },
    });
    if (existing) {
      return {
        message:
          existing.status === "ACTIVE"
            ? `Ya eres miembro de ${team.name}`
            : `Tu solicitud a ${team.name} sigue pendiente`,
      };
    }

    await prisma.teamMember.create({
      data: { teamId: team.id, profileId: profile.id },
    });
    revalidatePath("/box");
    revalidatePath(`/coach/${team.id}/members`);
    return {
      message: `Solicitud enviada a ${team.name}. Verás la programación cuando te acepten.`,
    };
  } catch (e) {
    if (isUniqueViolation(e)) return { message: "Solicitud ya enviada" };
    return { error: errorMessage(e) };
  }
}

export async function approveMember(formData: FormData) {
  const teamId = String(formData.get("teamId") || "");
  const memberId = String(formData.get("memberId") || "");
  try {
    await requireTeamOwner(teamId);
    await prisma.teamMember.update({
      where: { id: memberId, teamId },
      data: { status: "ACTIVE", joinedAt: new Date() },
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/coach/${teamId}`, "layout");
  revalidatePath("/box");
  return { ok: true };
}

export async function removeMember(formData: FormData) {
  const teamId = String(formData.get("teamId") || "");
  const memberId = String(formData.get("memberId") || "");
  try {
    await requireTeamOwner(teamId);
    await prisma.teamMember.delete({ where: { id: memberId, teamId } });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/coach/${teamId}`, "layout");
  revalidatePath("/box");
  return { ok: true };
}

export async function leaveTeam(formData: FormData) {
  const teamId = String(formData.get("teamId") || "");
  try {
    const profile = await requireAccount();
    await prisma.teamMember.deleteMany({
      where: { teamId, profileId: profile.id },
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/", "layout");
  return { message: "Saliste del equipo", redirectTo: "/box" };
}
