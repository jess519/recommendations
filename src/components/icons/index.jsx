export const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Insights nav item chevron (20×20, white stroke) */
export const IconInsightsChevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M5 7.5L7.73726 10.2373C8.52929 11.0293 8.92531 11.4253 9.38197 11.5737C9.78365 11.7042 10.2163 11.7042 10.618 11.5737C11.0747 11.4253 11.4707 11.0293 12.2627 10.2373L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Search icon – inside search box (Figma 116:1577): dark grey outline magnifying glass */
export const IconFilterFunnel = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M2 4h16l-5 7v5l-4 2v-7L2 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Notification icon – Figma 115:945: bell outline + 8px red dot top-right */
export const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M10 3.5a3.5 3.5 0 00-3.5 3.5v2.2c0 .35-.12.7-.32.95L4.5 13v1.2c0 .4.3.8.8.8h9.4c.5 0 .8-.4.8-.8V13l-1.68-2.85a2.5 2.5 0 01-.32-.95V7a3.5 3.5 0 00-3.5-3.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 15.2a2 2 0 004 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.5 14.2v.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
export const NotificationButton = () => (
  <button type="button" className="relative rounded-[10px] w-9 h-9 flex items-center justify-center hover:bg-gray-100 shrink-0" aria-label="Notifications">
    <span className="absolute left-2 top-2 text-[#4a5565]">
      <IconBell />
    </span>
    <span className="absolute left-6 top-1 w-2 h-2 rounded-full bg-[#fb2c36]" aria-hidden />
  </button>
)
export const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 8h16M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
export const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
export const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M12 2l2 2-8 8H4v-2l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconChevronDownSelect = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 pointer-events-none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconWarning = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <path d="M6 1l5 9H1L6 1z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.2" />
    <path d="M6 4v3M6 8v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
export const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 4v2l2 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
export const IconTrendUp = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M3 14l5-5 4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 8h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconLocation = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2C6.7 2 4 4.7 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
export const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M2 6l6-4 10 10-6 6-10-10v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
  </svg>
)
export const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
  </svg>
)
export const IconPound = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M7 20h10M7 4h2c2.2 0 4 1.8 4 4s-1.8 4-4 4H7M13 4h2c2.2 0 4 1.8 4 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M3 17l5-5 4 4 6-8 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2l2.2 4.5 4.9.7-3.5 3.4.8 4.9L10 13.5l-4.4 2.1.8-4.9-3.5-3.4 4.9-.7L10 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)
export const IconInfo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="6.5" r="1.25" fill="currentColor" />
    <path d="M10 9v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
export const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 4c-4 0-7 3-9 6 2 3 5 6 9 6s7-3 9-6c-2-3-5-6-9-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
export const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <rect x="3.5" y="8" width="13" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 8V5a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
export const IconSparkle = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2l1.2 3.6 3.8.2-2.8 2.4 1 3.6L10 10.4l-2.2 2.4 1-3.6L6 5.8l3.8-.2L10 2z" fill="currentColor" />
  </svg>
)
export const IconAI = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2v3M10 15v3M2 10h3M15 10h3M5.05 5.05l2.1 2.1M12.85 12.85l2.1 2.1M5.05 14.95l2.1-2.1M12.85 7.15l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
export const IconSave = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M4 2h9l3 3v12H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M4 2v16h12V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10h6M7 13h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
export const IconShare = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M15 10v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5M10 12V3M10 3l3 3M10 3L7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconBulb = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 3c-2.2 0-4 1.8-4 4 0 1.2.5 2.2 1.3 2.9l.7.6v.5h4V10.5l.7-.6c.8-.7 1.3-1.7 1.3-2.9 0-2.2-1.8-4-4-4zM7 13v1.5c0 .3.2.5.5.5h5c.3 0 .5-.2.5-.5V13H7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
  </svg>
)
export const IconDocument = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M4 2h8l4 4v12H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10h8M6 13h8M6 16h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
export const IconEllipsisVertical = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <circle cx="10" cy="4" r="1.5" fill="currentColor" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    <circle cx="10" cy="16" r="1.5" fill="currentColor" />
  </svg>
)

// Sidebar icons – Autone Design System 2.0 (12299:63282), inactive #22272f
export const IconGrid = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
export const IconReplenishment = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M1.75 6.33301V11.4997C1.75 11.9642 1.75 12.1964 1.77886 12.391C1.95121 13.5529 2.8635 14.4652 4.02539 14.6375C4.21996 14.6664 4.4522 14.6664 4.91667 14.6664L6.21121 14.6663M0.75 7.33301L5.06634 3.01667C6.12239 1.96062 6.65041 1.4326 7.25929 1.23476C7.79487 1.06074 8.3718 1.06074 8.90738 1.23476C9.51625 1.4326 10.0443 1.96062 11.1003 3.01667L15.4167 7.33301" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.7628 7.76938L11.7518 7.16279L11.7518 7.16279C11.2657 6.87108 11.0226 6.72523 10.7631 6.66824C10.5335 6.61783 10.2958 6.61783 10.0662 6.66824C9.80673 6.72523 9.56364 6.87108 9.07746 7.16279L8.06647 7.76938C7.60633 8.04547 7.37626 8.18351 7.20915 8.37356C7.06126 8.54175 6.94975 8.7387 6.88162 8.95204C6.80463 9.19313 6.80463 9.46143 6.80463 9.99804V10.7332C6.80463 11.2032 6.80463 11.4382 6.86387 11.6515C6.93501 11.9077 7.06795 12.1425 7.25102 12.3353C7.40345 12.4958 7.60496 12.6167 8.00797 12.8585L9.03561 13.4751C9.53618 13.7754 9.78646 13.9256 10.0531 13.9819C10.289 14.0316 10.5329 14.0283 10.7673 13.9721C11.0323 13.9086 11.2784 13.7516 11.7705 13.4377L13.1372 12.5659C13.4613 12.3591 13.6234 12.2558 13.7409 12.1169C13.8449 11.9939 13.923 11.8513 13.9708 11.6976C14.0247 11.5238 14.0247 11.3316 14.0247 10.9472V9.99804C14.0247 9.46143 14.0247 9.19313 13.9477 8.95204C13.8796 8.7387 13.768 8.54175 13.6202 8.37356C13.453 8.18351 13.223 8.04546 12.7628 7.76938Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.78998 9.42942L10.8582 8.16553" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.4146 10.512L13.6636 8.52649M10.4146 10.512L7.16559 8.52649M10.4146 10.512V14.122" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Icon=new reorder – segment control (Figma 202:3165) – box with circular arrow */
/* Icon=reorder – Figma 2:1218 */
export const IconReorder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none" className="shrink-0" data-name="Icon=reorder" data-node-id="2:1218" aria-hidden>
    <path d="M14.0834 6.66687C14.0834 6.37443 14.0834 6.22821 14.0709 6.09155C13.9923 5.2347 13.5496 4.45283 12.8553 3.94462C12.7446 3.86357 12.6192 3.78834 12.3684 3.63788L9.88631 2.14862C8.98841 1.60988 8.53946 1.34051 8.06019 1.23526C7.63627 1.14217 7.19719 1.14217 6.77326 1.23526C6.294 1.34051 5.84505 1.60988 4.94715 2.14862L3.08048 3.26862C2.23068 3.7785 1.80578 4.03344 1.49715 4.38444C1.22402 4.69505 1.01808 5.05879 0.89225 5.4528C0.750061 5.89804 0.750061 6.39356 0.750061 7.38458V8.61582C0.750061 9.60685 0.750061 10.1024 0.89225 10.5476C1.01808 10.9416 1.22402 11.3054 1.49715 11.616C1.80578 11.967 2.23068 12.2219 3.08048 12.7318L5.1945 14.0002L6.18194 14.5927C6.63089 14.862 6.85536 14.9967 7.09499 15.0493C7.30696 15.0959 7.5265 15.0959 7.73846 15.0493C7.97809 14.9967 8.20257 14.862 8.65152 14.5927L9.36117 14.1669" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.41681 6.33358L8.23503 4.00024" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.41681 8.33354L13.4168 4.66687M7.41681 8.33354L1.41681 4.66687M7.41681 8.33354V15.0002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.4151 10.1948V9.22255M10.4151 10.1948C10.4151 10.1948 11.341 8.66699 13.1929 8.66699C13.7002 8.66699 14.1741 8.80137 14.5818 9.03628M10.4151 10.1948H11.3873M15.0262 12.0281C15.0262 12.0281 14.0603 13.5559 12.5262 13.5559C12.0203 13.5559 11.5459 13.4206 11.1373 13.1843M15.0262 12.0281H14.054M15.0262 12.0281V13.0003" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconRebalancing = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <rect x="1.33337" y="1.33337" width="13.3333" height="13.3333" rx="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 8C4 10.2091 5.79086 12 8 12C10.2091 12 11.6667 10 11.6667 10M12 8C12 5.79086 10.2222 4 8 4C5.33333 4 4.33333 6 4.33333 6M4.33333 6V4.33333M4.33333 6H6M11.6667 10H10M11.6667 10V11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconBuy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6h18M16 10a4 4 0 11-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
/* Insights nav — Icon=warehouse units (Figma 12299:63580 / 4605:28075), 20px glyph in 24px slot */
export const IconBars = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 17 16"
    fill="none"
    className={`shrink-0 ${className}`}
    data-name="Icon=warehouse units"
    data-node-id="I12299:63580;12203:35386"
    aria-hidden
  >
    <path
      d="M1.75 6.33301V11.4997C1.75 11.9642 1.75 12.1964 1.77886 12.391C1.95121 13.5529 2.8635 14.4652 4.02539 14.6375C4.21996 14.6664 4.4522 14.6664 4.91667 14.6664L6.21121 14.6663M0.75 7.33301L5.06634 3.01667C6.12239 1.96062 6.65041 1.4326 7.25929 1.23476C7.79487 1.06074 8.3718 1.06074 8.90738 1.23476C9.51625 1.4326 10.0443 1.96062 11.1003 3.01667L15.4167 7.33301"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.7628 7.76938L11.7518 7.16279L11.7518 7.16279C11.2657 6.87108 11.0226 6.72523 10.7631 6.66824C10.5335 6.61783 10.2958 6.61783 10.0662 6.66824C9.80673 6.72523 9.56364 6.87108 9.07746 7.16279L8.06647 7.76938C7.60633 8.04547 7.37626 8.18351 7.20915 8.37356C7.06126 8.54175 6.94975 8.7387 6.88162 8.95204C6.80463 9.19313 6.80463 9.46143 6.80463 9.99804V10.7332C6.80463 11.2032 6.80463 11.4382 6.86387 11.6515C6.93501 11.9077 7.06795 12.1425 7.25102 12.3353C7.40345 12.4958 7.60496 12.6167 8.00797 12.8585L9.03561 13.4751C9.53618 13.7754 9.78646 13.9256 10.0531 13.9819C10.289 14.0316 10.5329 14.0283 10.7673 13.9721C11.0323 13.9086 11.2784 13.7516 11.7705 13.4377L13.1372 12.5659C13.4613 12.3591 13.6234 12.2558 13.7409 12.1169C13.8449 11.9939 13.923 11.8513 13.9708 11.6976C14.0247 11.5238 14.0247 11.3316 14.0247 10.9472V9.99804C14.0247 9.46143 14.0247 9.19313 13.9477 8.95204C13.8796 8.7387 13.768 8.54175 13.6202 8.37356C13.453 8.18351 13.223 8.04546 12.7628 7.76938Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8.78998 9.42942L10.8582 8.16553" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M10.4146 10.512L13.6636 8.52649M10.4146 10.512L7.16559 8.52649M10.4146 10.512V14.122"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
/* Icon=new reorder – Optimiser nav (Figma 12205:40449 / 14404:7825) */
export const IconOptimiser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden data-name="Icon=new reorder" data-node-id="12205:40449">
    <path d="M17.5006 8.3335C17.5006 7.55493 17.5006 7.16564 17.4124 6.80999C17.2806 6.27849 17.0058 5.7932 16.6179 5.40672C16.3583 5.14811 16.0245 4.94783 15.3569 4.54726L11.6368 2.31524C10.7389 1.7765 10.29 1.50713 9.81072 1.40189C9.38679 1.30879 8.94772 1.30879 8.52379 1.40189C8.04453 1.50713 7.59558 1.7765 6.69768 2.31524L3.16434 4.43524C2.31455 4.94512 1.88965 5.20006 1.58101 5.55106C1.30788 5.86168 1.10194 6.22541 0.976112 6.61943C0.833923 7.06467 0.833923 7.56018 0.833923 8.55121V11.4491C0.833923 12.4401 0.833923 12.9357 0.976112 13.3809C1.10194 13.7749 1.30788 14.1386 1.58101 14.4493C1.88965 14.8003 2.31455 15.0552 3.16434 15.5651L6.38948 17.5002L7.93247 18.426C8.38142 18.6953 8.60589 18.83 8.84552 18.8826C9.05749 18.9292 9.27703 18.9292 9.48899 18.8826C9.72862 18.83 9.9531 18.6953 10.402 18.426L11.5978 17.7085" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.41736 7.91667L10.1901 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.16736 10.4168L16.6674 5.8335M9.16736 10.4168L1.66736 5.8335M9.16736 10.4168V18.7502" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.9152 12.7432V11.5279M12.9152 12.7432C12.9152 12.7432 14.0726 10.8335 16.3874 10.8335C17.0215 10.8335 17.6139 11.0015 18.1236 11.2951M12.9152 12.7432H14.1305M18.6791 15.0349C18.6791 15.0349 17.4718 16.9446 15.5541 16.9446C14.9217 16.9446 14.3287 16.7755 13.818 16.4801M18.6791 15.0349H17.4638M18.6791 15.0349V16.2502" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconGridDots = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (
      <circle key={`${r}-${c}`} cx={5 + c * 7} cy={5 + r * 7} r="2" fill="currentColor" />
    )))}
  </svg>
)
/* Icon=calendar-dates – Figma 202:3228 Event Date button (2:261) */
export const IconCalendarSidebar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 18 18" fill="none" className="shrink-0" data-name="Icon=calendar-dates" data-node-id="2:261" aria-hidden>
    <defs>
      <clipPath id="clip0_IconCalendarSidebar">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
    <g clipPath="url(#clip0_IconCalendarSidebar)">
      <rect x="1.5" y="1.5" width="15" height="15" rx="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 0.75L6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 0.75L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.75 6H5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="9.75" r="0.75" fill="currentColor" />
      <circle cx="6" cy="12.75" r="0.75" fill="currentColor" />
      <circle cx="9" cy="12.75" r="0.75" fill="currentColor" />
      <circle cx="12" cy="12.75" r="0.75" fill="currentColor" />
      <circle cx="9" cy="9.75" r="0.75" fill="currentColor" />
      <circle cx="12" cy="9.75" r="0.75" fill="currentColor" />
    </g>
  </svg>
)
/* Icon=list – list view (Figma 2:571) */
export const IconList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <defs>
      <clipPath id="clip0_IconList">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
    <g clipPath="url(#clip0_IconList)">
      <path d="M7.33337 13.3334L14.6667 13.3334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.33337 8L14.6667 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.33337 2.66663L14.6667 2.66662" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="2.66671" cy="2.66671" r="1.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.00004 7.99996C4.00004 8.73634 3.40309 9.33329 2.66671 9.33329C1.93033 9.33329 1.33337 8.73634 1.33337 7.99996C1.33337 7.26358 1.93033 6.66663 2.66671 6.66663C3.40309 6.66663 4.00004 7.26358 4.00004 7.99996Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="2.66671" cy="13.3333" r="1.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
)
/* Icon=calendar-note – week view (Figma 2:452) */
/* Icon=calendar-note – week view (Figma 2:452 / 203:1343 segment) */
export const IconCalendarNote = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <defs>
      <clipPath id="clip0_IconCalendarNote">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
    <g clipPath="url(#clip0_IconCalendarNote)">
      <rect x="1.33337" y="1.33337" width="13.3333" height="13.3333" rx="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.33337 0.666626L5.33337 2.66663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.6666 0.666626L10.6666 2.66663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.3333 5.33337H4.66663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
)
/* Parameters — Figma Icon=settings / sliders-horiz (12972:26099, DS 2.0 sidebar 12718:10114) */
export const IconGears = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden
    data-name="Icon=settings"
    data-node-id="I12972:26099;12203:35386"
  >
    {/* Top: track left, pill knob right, tail to edge */}
    <line x1="3" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="12" y="2" width="6" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <line x1="19" y1="5" x2="21" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Middle: knob left, track right */}
    <rect x="5" y="9" width="6" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Bottom: same pattern as top */}
    <line x1="3" y1="19" x2="11" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="12" y="16" width="6" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <line x1="19" y1="19" x2="21" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
export const IconTeam = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M12.5 8.33268C14.3409 8.33268 15.8333 6.8403 15.8333 4.99935C15.8333 3.1584 14.3409 1.66602 12.5 1.66602" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6.66665" cy="4.99935" r="3.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0.833313 14.9993C0.833313 13.1584 2.3257 11.666 4.16665 11.666H9.16664C11.0076 11.666 12.5 13.1584 12.5 14.9993V14.9993C12.5 16.8403 11.0076 18.3327 9.16665 18.3327H4.16665C2.3257 18.3327 0.833313 16.8403 0.833313 14.9993V14.9993Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.1667 18.3327H16.5C17.9728 18.3327 19.1667 17.1388 19.1667 15.666C19.1667 13.4569 17.3758 11.666 15.1667 11.666H14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconClockSidebar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
export const IconChat = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0 block">
    <path d="M10 0.917969C15.0163 0.918145 19.0838 4.98465 19.084 10.001C19.0838 15.0173 15.0163 19.0848 10 19.085C8.97617 19.0849 8.07457 18.9377 7.22754 18.6348C6.86937 18.5066 6.60549 18.4121 6.41406 18.3457C6.31862 18.3126 6.24418 18.2884 6.18848 18.2705C6.16125 18.2618 6.13997 18.2547 6.12402 18.25C6.11634 18.2478 6.10973 18.2462 6.10547 18.2451C6.10257 18.2443 6.10036 18.2435 6.09961 18.2432C5.69406 18.1479 5.42764 18.2253 5.08789 18.3867C4.76636 18.5396 4.1972 18.8901 3.51465 19.0039C2.49746 19.1732 1.59253 18.3402 1.67676 17.3125C1.70767 16.9368 1.84949 16.6047 1.95508 16.3711C2.07883 16.0973 2.15469 15.9502 2.2002 15.792C2.38122 15.1617 2.16846 14.7093 1.75391 13.8145C1.21645 12.6542 0.91704 11.3612 0.916992 10.001C0.917168 4.98465 4.98367 0.918144 10 0.917969ZM6.66699 9.16797C6.20675 9.16797 5.83301 9.54074 5.83301 10.001C5.83301 10.4612 6.20675 10.834 6.66699 10.834C7.12708 10.8338 7.5 10.4611 7.5 10.001C7.5 9.54085 7.12708 9.16814 6.66699 9.16797ZM10 9.16797C9.53976 9.16797 9.16699 9.54074 9.16699 10.001C9.16699 10.4612 9.53976 10.834 10 10.834C10.4602 10.834 10.833 10.4612 10.833 10.001C10.833 9.54074 10.4602 9.16797 10 9.16797ZM13.333 9.16797C12.8729 9.16814 12.5 9.54085 12.5 10.001C12.5 10.4611 12.8729 10.8338 13.333 10.834C13.7932 10.834 14.167 10.4612 14.167 10.001C14.167 9.54074 13.7932 9.16797 13.333 9.16797Z" fill="currentColor" />
  </svg>
)
export const IconDollar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M13.3334 2.35942C12.3126 1.91343 11.1852 1.66602 10 1.66602C5.39765 1.66602 1.66669 5.39698 1.66669 9.99935C1.66669 14.6017 5.39765 18.3327 10 18.3327C14.6024 18.3327 18.3334 14.6017 18.3334 9.99935C18.3334 8.12297 17.7132 6.39144 16.6667 4.99854M7.49992 11.666C7.49992 12.5865 8.24611 13.3327 9.16659 13.3327H11.0471C11.8495 13.3327 12.4999 12.6822 12.4999 11.8798C12.4999 11.2545 12.0998 10.6993 11.5065 10.5015L8.49333 9.49715C7.90008 9.2994 7.49992 8.74421 7.49992 8.11886C7.49992 7.31648 8.15038 6.66602 8.95276 6.66602H10.8333C11.7537 6.66602 12.4999 7.41221 12.4999 8.33268M9.99992 5.41602V14.5827" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="9.99935" r="8.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconFlagUK = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="13" viewBox="0 0 19 13" fill="none" className="shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M1.95029 -1.25H0V1.25L16.3725 13.75L18.3333 13.75V11.25L1.95029 -1.25Z" fill="white" />
    <path d="M0.650483 -1.25L18.3333 12.2854V13.75L17.6981 13.75L0 0.200559V-1.25H0.650483Z" fill="#F93939" />
    <path fillRule="evenodd" clipRule="evenodd" d="M16.5873 -1.25H18.3333V1.25C18.3333 1.25 6.99269 9.57806 1.74603 13.75H0V11.25L16.5873 -1.25Z" fill="white" />
    <path d="M18.3333 -1.25H17.7412L0 12.2971V13.75H0.650483L18.3333 0.211513V-1.25Z" fill="#F93939" />
    <path fillRule="evenodd" clipRule="evenodd" d="M6.66729 -1.25H11.6813V3.37682H18.3333V9.12013H11.6813V13.75H6.66729V9.12013H0V3.37682H6.66729V-1.25Z" fill="white" />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.7193 -1.25H10.614V4.51923H18.3333V7.98077H10.614V13.75H7.7193V7.98077H0V4.51923H7.7193V-1.25Z" fill="#F93939" />
  </svg>
)
export const IconTruck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M1 4h6v8H1V4zM7 6h2l3 3v3H7V6zM10 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="4" cy="12" r="1" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
export const IconLightbulb = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M6 14h4M8 12v-1M5.5 6.5a3 3 0 015 0c0 .8-.3 1.5-.7 2.1L8 9.5V11M8 2v1M3 5l.7.7M12.3 5.7L13 5M4 9H3M13 9h-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8 3a3.5 3.5 0 00-2.5 5.9v.6c0 .3.2.5.5.5h4c.3 0 .5-.2.5-.5v-.6A3.5 3.5 0 008 3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconCollapse = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M12 5l-5 5 5 5M7 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Collapsed sidebar — expand (chevrons right), Figma Icon=Expand 12206:42111 */
export const IconExpand = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M8 5l5 5-5 5M13 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconOutlet = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12.5" cy="12.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const IconWarehouse = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M2 8l8-5 8 5v9H2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 3v14M2 10h16M2 13h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="7" y="13" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

export const IconEcomm = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="10" cy="10" rx="5" ry="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 3v14M4 6c3 2 6 2 6 4s-3 2-6 4M16 6c-3 2-6 2-6 4s3 2 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
