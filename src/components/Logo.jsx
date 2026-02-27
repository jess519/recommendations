/* Logo from Figma 145-914: 24px icon + wordmark, gap 6px. Assets use dark fill; invert for white on sidebar. */
export default function AutoneLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-[6px] h-6 [&_img]:invert ${className}`} data-name="autone-logo">
      <img src="/logo-icon.svg" alt="" className="w-6 h-6 shrink-0 block" aria-hidden />
      <img src="/logo-wordmark.svg" alt="autone" className="h-[24px] w-[112px] shrink-0 block" />
    </div>
  )
}
