/**
 * AuthLogo — logo display for Auth pages (Login, Register, etc.)
 */
import { Link } from "react-router-dom";

interface Props {
  /** Logo image source */
  src: string;
  alt?: string;
  /** Size class, e.g. "w-32 h-32" */
  size?: string;
  /** Wrap in a Link to this path, or null for no link */
  linkTo?: string;
}

export function AuthLogo({ src, alt = "Exegesis Logo", size = "w-32 h-32", linkTo }: Props) {
  const logo = (
    <div className={`${size} flex items-center justify-center p-2`}>
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex flex-col items-center gap-3 mb-2 anim-fade">
        {logo}
      </Link>
    );
  }

  return logo;
}
