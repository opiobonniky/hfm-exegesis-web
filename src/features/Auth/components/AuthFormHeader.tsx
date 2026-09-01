/**
 * AuthFormHeader — title + subtitle for Auth form pages.
 */

interface Props {
  title: string;
  subtitle: string;
}

export function AuthFormHeader({ title, subtitle }: Props) {
  return (
    <div className="anim-fade text-center">
      <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">
        {title}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {subtitle}
      </p>
    </div>
  );
}
