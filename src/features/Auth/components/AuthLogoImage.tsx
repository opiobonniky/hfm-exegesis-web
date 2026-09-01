/**
 * AuthLogoImage — logo image with container.
 */
interface AuthLogoImageProps {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-20 h-20",
  lg: "w-24 h-24",
};

export function AuthLogoImage({ src, alt = "Exegesis Logo", size = "lg" }: AuthLogoImageProps) {
  return (
    <div className={`${sizes[size]} flex items-center justify-center p-2`}>
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  );
}
