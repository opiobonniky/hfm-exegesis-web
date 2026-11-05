/**
 * GoogleRegisterHeader — avatar + welcome text for Google registration.
 */

interface GoogleRegisterHeaderProps {
  photoUrl: string;
  firstName: string;
  lastName: string;
  welcomeText: string;
  description: string;
}

export function GoogleRegisterHeader({ photoUrl, firstName, lastName, welcomeText, description }: GoogleRegisterHeaderProps) {
  return (
    <div className="text-center">
      <div className="size-16 rounded-2xl border border-primary/20 ring-4 ring-primary/5 overflow-hidden mx-auto mb-5">
        {photoUrl ? (
          <img src={photoUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {firstName?.[0] || "G"}{lastName?.[0] || "U"}
            </span>
          </div>
        )}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{welcomeText}</h1>
      <p className="text-sm leading-6 text-muted-foreground mt-3">{description}</p>
    </div>
  );
}
