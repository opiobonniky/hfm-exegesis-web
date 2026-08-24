import { Heart } from "lucide-react";

export function SowerBanner() {
  return (
    <section className="bg-gradient-to-r from-violet-600 to-purple-700 py-10">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-card/15 mb-4">
          <Heart className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Bible Reading Is Always Free</h2>
        <p className="text-violet-200 text-sm max-w-xl mx-auto leading-relaxed px-2">
          Subscription only gates advanced study tools, not Scripture itself. Every translation, every chapter, every verse remains freely accessible to everyone — always.
        </p>
      </div>
    </section>
  );
}
