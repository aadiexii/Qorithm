import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: "#161618",
    colorInputBackground: "#161618",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#a1a1aa",
    colorPrimary: "#ffffff",
    colorNeutral: "#27272a",
    colorDanger: "#f87171",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-manrope), system-ui, sans-serif",
  },
  elements: {
    card: "border border-white/10 shadow-xl",
    headerTitle: "text-white text-xl font-extrabold tracking-tight",
    headerSubtitle: "text-slate-400 text-sm",
    socialButtonsBlockButton:
      "border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors",
    socialButtonsBlockButtonText: "text-white font-medium",
    dividerLine: "bg-white/10",
    dividerText: "text-slate-500",
    formFieldLabel: "text-slate-300 text-sm font-medium",
    formFieldInput:
      "bg-[#0a0a0a] border border-white/10 text-white placeholder:text-slate-600 rounded-lg focus:border-white/30 transition-colors",
    formButtonPrimary:
      "bg-white text-black font-semibold rounded-lg hover:opacity-90 transition-opacity",
    footerActionText: "text-slate-400",
    footerActionLink: "text-white hover:text-slate-300 font-medium",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-slate-400 hover:text-white",
    otpCodeFieldInput: "bg-[#0a0a0a] border border-white/10 text-white",
    alert: "bg-white/5 border border-white/10 text-slate-300",
    alertText: "text-slate-300",
    alertIcon: "text-slate-400",
  },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center p-4">
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
