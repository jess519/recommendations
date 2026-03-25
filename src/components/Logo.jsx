/**
 * Autone logo — Figma DS 2.0 `AutoneLogo` (12207:7492), from sidebar 13296:19601.
 * SVGs are dark monotone; brightness(0) + invert renders them as #ffffff on the sidebar.
 * Natural row width 142.165px scaled proportionally to 118px.
 */
const LOGO_NATURAL_WIDTH = 142.165
const LOGO_TARGET_WIDTH = 118
const logoScale = LOGO_TARGET_WIDTH / LOGO_NATURAL_WIDTH

export default function AutoneLogo({ className = '', collapsed = false }) {
  if (collapsed) {
    return (
      <div
        className={`flex size-6 shrink-0 items-center justify-center text-white [&_img]:brightness-0 [&_img]:invert ${className}`}
        data-name="autone-logo"
        data-node-id="12207:7493"
      >
        <img
          src="/autone-logo-mark.svg"
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 translate-x-[3px] block"
          aria-hidden
        />
      </div>
    )
  }

  const mark = 24 * logoScale
  const gap = 5.924 * logoScale
  const wordW = 112.22 * logoScale
  const wordH = 23.971 * logoScale

  return (
    <div
      className={`flex h-6 w-[118px] shrink-0 items-center justify-start text-white [&_img]:brightness-0 [&_img]:invert ${className}`}
      data-name="autone-logo"
      data-node-id="12207:7492"
    >
      <div className="flex shrink-0 items-center" style={{ gap: `${gap}px` }}>
        <img
          src="/autone-logo-mark.svg"
          alt=""
          width={24}
          height={24}
          style={{ width: mark, height: mark }}
          className="shrink-0 block"
          aria-hidden
        />
        <img
          src="/autone-logo-wordmark.svg"
          alt="autone"
          width={112.22}
          height={23.971}
          style={{ width: wordW, height: wordH }}
          className="shrink-0 block"
        />
      </div>
    </div>
  )
}
