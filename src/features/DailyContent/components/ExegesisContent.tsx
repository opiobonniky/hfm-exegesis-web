import type { ExegesisContentProps } from "../types";
import { DAILY_EXEGESIS_SECTIONS } from "../constants/dailyExegesis";

export function ExegesisContent({ item }: ExegesisContentProps) {
  return (
    <div className="space-y-6 mt-6">
      {DAILY_EXEGESIS_SECTIONS.map(({ key, title }) => (
        <section key={key}>
          <h2 className="text-lg font-semibold mb-2 text-foreground">{title}</h2>
          <p className="whitespace-pre-wrap text-muted-foreground leading-6">
            {item[key] || `No ${title.toLowerCase()} provided.`}
          </p>
        </section>
      ))}
    </div>
  );
}
