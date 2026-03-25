/**
 * Autone logo — Figma DS 2.0 `AutoneLogo` (12207:7492), from sidebar 13296:19601.
 * SVGs are dark monotone; brightness(0) + invert renders them as #ffffff on the sidebar.
 */
export default function AutoneLogo({ className = '' }) {
  return (
    <div
      className={`flex h-6 items-center gap-[5.924px] shrink-0 w-[142.165px] text-white [&_img]:brightness-0 [&_img]:invert ${className}`}
      data-name="autone-logo"
      data-node-id="12207:7492"
    >
      <img
        src="/autone-logo-mark.svg"
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0 block"
        aria-hidden
      />
      <img
        src="/autone-logo-wordmark.svg"
        alt="autone"
        width={112.22}
        height={23.971}
        className="h-[23.971px] w-[112.22px] shrink-0 block"
      />
    </div>
  )
}
