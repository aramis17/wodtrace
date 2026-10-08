import { Input, Label, Select, Textarea } from "./ui/input";
import { BLOCK_KIND_LABELS, type BlockKind } from "@/lib/team-rules";
import { SCORE_TYPE_LABELS, type ScoreType } from "@/lib/types";

/** Shared fields for adding and editing a programming block. `idPrefix` keeps label ids unique per block. */
export function BlockFields({
  idPrefix,
  kind = "WOD",
  title = "",
  content = "",
  scoreType = null,
}: {
  idPrefix: string;
  kind?: BlockKind;
  title?: string;
  content?: string;
  scoreType?: ScoreType | null;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${idPrefix}-kind`}>Tipo</Label>
          <Select id={`${idPrefix}-kind`} name="kind" defaultValue={kind}>
            {(Object.keys(BLOCK_KIND_LABELS) as BlockKind[]).map((k) => (
              <option key={k} value={k}>
                {BLOCK_KIND_LABELS[k]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-score`}>Puntuación</Label>
          <Select
            id={`${idPrefix}-score`}
            name="scoreType"
            defaultValue={scoreType ?? ""}
          >
            <option value="">Sin puntuar</option>
            {(Object.keys(SCORE_TYPE_LABELS) as ScoreType[]).map((t) => (
              <option key={t} value={t}>
                {SCORE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-title`}>Título</Label>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={title}
          placeholder="Ej. Fran, Back Squat 5x5"
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-content`}>Detalle</Label>
        <Textarea
          id={`${idPrefix}-content`}
          name="content"
          rows={4}
          defaultValue={content}
          placeholder={"21-15-9\nThrusters 43/29 kg\nPull-ups"}
        />
      </div>
    </div>
  );
}
