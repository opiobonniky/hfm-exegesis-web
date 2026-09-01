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
      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
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
      <h1 className="text-2xl font-bold">{welcomeText}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
