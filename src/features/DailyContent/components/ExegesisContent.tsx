// ExegesisContent — renders Introduction, Context, Teaching, Application, Prayer sections

interface Exegesis {
  introduction: string; contextSummary: string; teachingBody: string;
  application: string; prayer: string;
}

const SECTIONS: { key: keyof Exegesis; title: string }[] = [
  { key: "introduction", title: "Introduction" },
  { key: "contextSummary", title: "Context Summary" },
  { key: "teachingBody", title: "Teaching" },
  { key: "application", title: "Application" },
  { key: "prayer", title: "Prayer" },
];

export function ExegesisContent({ item }: { item: Exegesis }) {
  return (
    <div className="space-y-6 mt-6">
      {SECTIONS.map(({ key, title }) => (
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
