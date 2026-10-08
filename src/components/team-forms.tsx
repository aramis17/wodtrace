"use client";

import { ActionForm, SubmitButton } from "./action-form";
import { Input, Label, Select, Textarea } from "./ui/input";
import { createTeam, joinTeam } from "@/lib/actions/teams";

export function JoinTeamForm() {
  return (
    <ActionForm action={joinTeam} resetOnSuccess className="space-y-3">
      <div>
        <Label htmlFor="code">Código del box o coach</Label>
        <div className="flex gap-2">
          <Input
            id="code"
            name="code"
            required
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="Ej. K7M2QX"
            className="font-display text-lg uppercase tracking-[0.2em]"
          />
          <SubmitButton pendingLabel="…">Unirme</SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}

export function CreateTeamForm() {
  return (
    <ActionForm action={createTeam} className="space-y-4">
      <div>
        <Label htmlFor="kind">Tipo</Label>
        <Select id="kind" name="kind" defaultValue="BOX">
          <option value="BOX">Box · programación diaria para todos los alumnos</option>
          <option value="COACH">Coach · atletas con programación grupal o individual</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required minLength={2} placeholder="CrossFit Forja" />
      </div>
      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <SubmitButton className="w-full" pendingLabel="Creando…">
        Crear
      </SubmitButton>
    </ActionForm>
  );
}
