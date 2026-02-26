import { useState, useRef } from 'react'

// Simple inline icons (no external assets)
const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Insights nav item chevron (20×20, white stroke) */
const IconInsightsChevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M5 7.5L7.73726 10.2373C8.52929 11.0293 8.92531 11.4253 9.38197 11.5737C9.78365 11.7042 10.2163 11.7042 10.618 11.5737C11.0747 11.4253 11.4707 11.0293 12.2627 10.2373L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Search icon – inside search box (Figma 116:1577): dark grey outline magnifying glass */
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Notification icon – Figma 115:945: bell outline + 8px red dot top-right */
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M10 3.5a3.5 3.5 0 00-3.5 3.5v2.2c0 .35-.12.7-.32.95L4.5 13v1.2c0 .4.3.8.8.8h9.4c.5 0 .8-.4.8-.8V13l-1.68-2.85a2.5 2.5 0 01-.32-.95V7a3.5 3.5 0 00-3.5-3.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 15.2a2 2 0 004 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.5 14.2v.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
const NotificationButton = () => (
  <button type="button" className="relative rounded-[10px] w-9 h-9 flex items-center justify-center hover:bg-gray-100 shrink-0" aria-label="Notifications">
    <span className="absolute left-2 top-2 text-[#4a5565]">
      <IconBell />
    </span>
    <span className="absolute left-6 top-1 w-2 h-2 rounded-full bg-[#fb2c36]" aria-hidden />
  </button>
)
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 8h16M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M12 2l2 2-8 8H4v-2l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconChevronDownSelect = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 pointer-events-none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconWarning = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <path d="M6 1l5 9H1L6 1z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.2" />
    <path d="M6 4v3M6 8v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 4v2l2 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
const IconTrendUp = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M3 14l5-5 4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 8h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconLocation = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2C6.7 2 4 4.7 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M2 6l6-4 10 10-6 6-10-10v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
  </svg>
)
const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
  </svg>
)
const IconPound = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M7 20h10M7 4h2c2.2 0 4 1.8 4 4s-1.8 4-4 4H7M13 4h2c2.2 0 4 1.8 4 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M3 17l5-5 4 4 6-8 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2l2.2 4.5 4.9.7-3.5 3.4.8 4.9L10 13.5l-4.4 2.1.8-4.9-3.5-3.4 4.9-.7L10 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)
const IconInfo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="6.5" r="1.25" fill="currentColor" />
    <path d="M10 9v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 4c-4 0-7 3-9 6 2 3 5 6 9 6s7-3 9-6c-2-3-5-6-9-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <rect x="3.5" y="8" width="13" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 8V5a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
const IconSparkle = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2l1.2 3.6 3.8.2-2.8 2.4 1 3.6L10 10.4l-2.2 2.4 1-3.6L6 5.8l3.8-.2L10 2z" fill="currentColor" />
  </svg>
)
const IconAI = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 2v3M10 15v3M2 10h3M15 10h3M5.05 5.05l2.1 2.1M12.85 12.85l2.1 2.1M5.05 14.95l2.1-2.1M12.85 7.15l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const IconSave = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M4 2h9l3 3v12H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M4 2v16h12V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10h6M7 13h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
const IconShare = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M15 10v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5M10 12V3M10 3l3 3M10 3L7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconBulb = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M10 3c-2.2 0-4 1.8-4 4 0 1.2.5 2.2 1.3 2.9l.7.6v.5h4V10.5l.7-.6c.8-.7 1.3-1.7 1.3-2.9 0-2.2-1.8-4-4-4zM7 13v1.5c0 .3.2.5.5.5h5c.3 0 .5-.2.5-.5V13H7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
  </svg>
)
const IconDocument = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M4 2h8l4 4v12H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10h8M6 13h8M6 16h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
const IconEllipsisVertical = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <circle cx="10" cy="4" r="1.5" fill="currentColor" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    <circle cx="10" cy="16" r="1.5" fill="currentColor" />
  </svg>
)

// Sidebar icons – Autone Design System 2.0 (12299:63282), inactive #22272f
const IconGrid = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const IconReplenishment = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M1.75 6.33301V11.4997C1.75 11.9642 1.75 12.1964 1.77886 12.391C1.95121 13.5529 2.8635 14.4652 4.02539 14.6375C4.21996 14.6664 4.4522 14.6664 4.91667 14.6664L6.21121 14.6663M0.75 7.33301L5.06634 3.01667C6.12239 1.96062 6.65041 1.4326 7.25929 1.23476C7.79487 1.06074 8.3718 1.06074 8.90738 1.23476C9.51625 1.4326 10.0443 1.96062 11.1003 3.01667L15.4167 7.33301" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.7628 7.76938L11.7518 7.16279L11.7518 7.16279C11.2657 6.87108 11.0226 6.72523 10.7631 6.66824C10.5335 6.61783 10.2958 6.61783 10.0662 6.66824C9.80673 6.72523 9.56364 6.87108 9.07746 7.16279L8.06647 7.76938C7.60633 8.04547 7.37626 8.18351 7.20915 8.37356C7.06126 8.54175 6.94975 8.7387 6.88162 8.95204C6.80463 9.19313 6.80463 9.46143 6.80463 9.99804V10.7332C6.80463 11.2032 6.80463 11.4382 6.86387 11.6515C6.93501 11.9077 7.06795 12.1425 7.25102 12.3353C7.40345 12.4958 7.60496 12.6167 8.00797 12.8585L9.03561 13.4751C9.53618 13.7754 9.78646 13.9256 10.0531 13.9819C10.289 14.0316 10.5329 14.0283 10.7673 13.9721C11.0323 13.9086 11.2784 13.7516 11.7705 13.4377L13.1372 12.5659C13.4613 12.3591 13.6234 12.2558 13.7409 12.1169C13.8449 11.9939 13.923 11.8513 13.9708 11.6976C14.0247 11.5238 14.0247 11.3316 14.0247 10.9472V9.99804C14.0247 9.46143 14.0247 9.19313 13.9477 8.95204C13.8796 8.7387 13.768 8.54175 13.6202 8.37356C13.453 8.18351 13.223 8.04546 12.7628 7.76938Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.78998 9.42942L10.8582 8.16553" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.4146 10.512L13.6636 8.52649M10.4146 10.512L7.16559 8.52649M10.4146 10.512V14.122" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Icon=new reorder – segment control (Figma 202:3165) – box with circular arrow */
/* Icon=reorder – Figma 2:1218 */
const IconReorder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none" className="shrink-0" data-name="Icon=reorder" data-node-id="2:1218" aria-hidden>
    <path d="M14.0834 6.66687C14.0834 6.37443 14.0834 6.22821 14.0709 6.09155C13.9923 5.2347 13.5496 4.45283 12.8553 3.94462C12.7446 3.86357 12.6192 3.78834 12.3684 3.63788L9.88631 2.14862C8.98841 1.60988 8.53946 1.34051 8.06019 1.23526C7.63627 1.14217 7.19719 1.14217 6.77326 1.23526C6.294 1.34051 5.84505 1.60988 4.94715 2.14862L3.08048 3.26862C2.23068 3.7785 1.80578 4.03344 1.49715 4.38444C1.22402 4.69505 1.01808 5.05879 0.89225 5.4528C0.750061 5.89804 0.750061 6.39356 0.750061 7.38458V8.61582C0.750061 9.60685 0.750061 10.1024 0.89225 10.5476C1.01808 10.9416 1.22402 11.3054 1.49715 11.616C1.80578 11.967 2.23068 12.2219 3.08048 12.7318L5.1945 14.0002L6.18194 14.5927C6.63089 14.862 6.85536 14.9967 7.09499 15.0493C7.30696 15.0959 7.5265 15.0959 7.73846 15.0493C7.97809 14.9967 8.20257 14.862 8.65152 14.5927L9.36117 14.1669" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.41681 6.33358L8.23503 4.00024" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.41681 8.33354L13.4168 4.66687M7.41681 8.33354L1.41681 4.66687M7.41681 8.33354V15.0002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.4151 10.1948V9.22255M10.4151 10.1948C10.4151 10.1948 11.341 8.66699 13.1929 8.66699C13.7002 8.66699 14.1741 8.80137 14.5818 9.03628M10.4151 10.1948H11.3873M15.0262 12.0281C15.0262 12.0281 14.0603 13.5559 12.5262 13.5559C12.0203 13.5559 11.5459 13.4206 11.1373 13.1843M15.0262 12.0281H14.054M15.0262 12.0281V13.0003" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconRebalancing = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <rect x="1.33337" y="1.33337" width="13.3333" height="13.3333" rx="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 8C4 10.2091 5.79086 12 8 12C10.2091 12 11.6667 10 11.6667 10M12 8C12 5.79086 10.2222 4 8 4C5.33333 4 4.33333 6 4.33333 6M4.33333 6V4.33333M4.33333 6H6M11.6667 10H10M11.6667 10V11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconBuy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6h18M16 10a4 4 0 11-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
/* Icon=bars – Insights nav (Figma 13111:40 / 14404:7252) – three vertical bars, increasing height L→R */
const IconBars = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" data-name="Icon=bars" data-node-id="I14404:7252;12203:35386" aria-hidden>
    <path d="M6 18v-5M12 18v-9M18 18v-13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* Icon=new reorder – Optimiser nav (Figma 12205:40449 / 14404:7825) */
const IconOptimiser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden data-name="Icon=new reorder" data-node-id="12205:40449">
    <path d="M17.5006 8.3335C17.5006 7.55493 17.5006 7.16564 17.4124 6.80999C17.2806 6.27849 17.0058 5.7932 16.6179 5.40672C16.3583 5.14811 16.0245 4.94783 15.3569 4.54726L11.6368 2.31524C10.7389 1.7765 10.29 1.50713 9.81072 1.40189C9.38679 1.30879 8.94772 1.30879 8.52379 1.40189C8.04453 1.50713 7.59558 1.7765 6.69768 2.31524L3.16434 4.43524C2.31455 4.94512 1.88965 5.20006 1.58101 5.55106C1.30788 5.86168 1.10194 6.22541 0.976112 6.61943C0.833923 7.06467 0.833923 7.56018 0.833923 8.55121V11.4491C0.833923 12.4401 0.833923 12.9357 0.976112 13.3809C1.10194 13.7749 1.30788 14.1386 1.58101 14.4493C1.88965 14.8003 2.31455 15.0552 3.16434 15.5651L6.38948 17.5002L7.93247 18.426C8.38142 18.6953 8.60589 18.83 8.84552 18.8826C9.05749 18.9292 9.27703 18.9292 9.48899 18.8826C9.72862 18.83 9.9531 18.6953 10.402 18.426L11.5978 17.7085" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.41736 7.91667L10.1901 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.16736 10.4168L16.6674 5.8335M9.16736 10.4168L1.66736 5.8335M9.16736 10.4168V18.7502" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.9152 12.7432V11.5279M12.9152 12.7432C12.9152 12.7432 14.0726 10.8335 16.3874 10.8335C17.0215 10.8335 17.6139 11.0015 18.1236 11.2951M12.9152 12.7432H14.1305M18.6791 15.0349C18.6791 15.0349 17.4718 16.9446 15.5541 16.9446C14.9217 16.9446 14.3287 16.7755 13.818 16.4801M18.6791 15.0349H17.4638M18.6791 15.0349V16.2502" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconGridDots = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (
      <circle key={`${r}-${c}`} cx={5 + c * 7} cy={5 + r * 7} r="2" fill="currentColor" />
    )))}
  </svg>
)
/* Icon=calendar-dates – Figma 202:3228 Event Date button (2:261) */
const IconCalendarSidebar = () => (
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
const IconList = () => (
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
const IconCalendarNote = () => (
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
const IconGears = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="0 0 17 15" fill="none" className="shrink-0">
    <path d="M9.28516 1.49023L9.87746 1.95032L9.87805 1.94955L9.28516 1.49023ZM11.75 1.00586L12.1251 0.35638L12.125 0.35634L11.75 1.00586ZM12.5625 3.38184L13.2563 3.6666L13.2568 3.6655L12.5625 3.38184ZM12.6973 4.68359L12.0486 5.06003L12.0486 5.06007L12.6973 4.68359ZM12.7051 4.69727L12.0553 5.07184L12.0553 5.07189L12.7051 4.69727ZM13.7646 5.46484L13.663 6.20792L13.6633 6.20797L13.7646 5.46484ZM15.416 7.35742L16.166 7.35761V7.35742H15.416ZM13.7646 9.24902L13.8653 9.99224L13.866 9.99215L13.7646 9.24902ZM12.6992 10.0244L12.0502 9.64855L12.0501 9.64875L12.6992 10.0244ZM12.5625 11.332L13.2568 11.0483L13.2565 11.0476L12.5625 11.332ZM11.75 13.708L12.125 14.3575L12.1251 14.3575L11.75 13.708ZM9.28516 13.2236L8.69197 13.6826L8.69228 13.683L9.28516 13.2236ZM8.0918 12.6904V13.4404L8.09296 13.4404L8.0918 12.6904ZM8.07324 12.6904L8.07174 13.4404H8.07324V12.6904ZM6.88086 13.2236L7.47373 13.683L7.47452 13.682L6.88086 13.2236ZM4.41602 13.708L4.04095 14.3575L4.04103 14.3575L4.41602 13.708ZM3.60352 11.332L4.2978 11.6157L4.29816 11.6148L3.60352 11.332ZM3.46777 10.0283L4.11675 9.65238L4.11672 9.65234L3.46777 10.0283ZM3.45996 10.0146L2.80988 10.3887L2.80991 10.3887L3.45996 10.0146ZM2.40137 9.24902L2.30003 9.99215L2.30055 9.99222L2.40137 9.24902ZM0.75 7.35742H0V7.35761L0.75 7.35742ZM2.40137 5.46484L2.50271 6.20797L2.50314 6.20791L2.40137 5.46484ZM3.45996 4.69824L2.81015 4.32375L2.81015 4.32375L3.45996 4.69824ZM3.46875 4.68359L4.11737 5.06014L4.11742 5.06006L3.46875 4.68359ZM3.60352 3.38184L2.90922 3.66547L2.90933 3.66575L3.60352 3.38184ZM4.41602 1.00586L4.04102 0.35634L4.04097 0.356369L4.41602 1.00586ZM6.88086 1.49023L6.28796 1.94955L6.28808 1.94971L6.88086 1.49023ZM8.07422 2.02344V1.27344L8.0729 1.27344L8.07422 2.02344ZM8.09082 2.02344L8.09185 1.27344H8.09082V2.02344ZM6.08301 7.35645L5.33301 7.35628V7.35645H6.08301ZM10.083 7.35645H10.833V7.35628L10.083 7.35645ZM9.28516 1.49023L9.87805 1.94955C10.2331 1.49123 10.8729 1.3655 11.375 1.65538L11.75 1.00586L12.125 0.35634C10.9733 -0.3086 9.5067 -0.0203767 8.69226 1.03091L9.28516 1.49023ZM11.75 1.00586L11.3749 1.65534C11.8767 1.9451 12.0875 2.56142 11.8682 3.09817L12.5625 3.38184L13.2568 3.6655C13.7596 2.43491 13.2766 1.02139 12.1251 0.35638L11.75 1.00586ZM12.5625 3.38184L11.8687 3.09708C11.5854 3.78729 11.7312 4.5131 12.0486 5.06003L12.6973 4.68359L13.346 4.30715C13.2023 4.05962 13.1909 3.82614 13.2563 3.6666L12.5625 3.38184ZM12.6973 4.68359L12.0486 5.06007C12.0479 5.05894 12.0477 5.05846 12.049 5.06085C12.0498 5.06228 12.0525 5.06704 12.0553 5.07184L12.7051 4.69727L13.3548 4.32269C13.355 4.32301 13.3551 4.32317 13.3533 4.32C13.3521 4.3178 13.3492 4.31273 13.3459 4.30712L12.6973 4.68359ZM12.7051 4.69727L12.0553 5.07189C12.3705 5.6185 12.925 6.10697 13.663 6.20792L13.7646 5.46484L13.8663 4.72176C13.695 4.69833 13.4981 4.57118 13.3548 4.32265L12.7051 4.69727ZM13.7646 5.46484L13.6633 6.20797C14.2374 6.28626 14.666 6.77731 14.666 7.35742H15.416H16.166C16.166 6.02791 15.184 4.90146 13.866 4.72172L13.7646 5.46484ZM15.416 7.35742L14.666 7.35723C14.6659 7.93699 14.2375 8.4276 13.6633 8.5059L13.7646 9.24902L13.866 9.99215C15.1836 9.81248 16.1657 8.68706 16.166 7.35761L15.416 7.35742ZM13.7646 9.24902L13.664 8.50581C12.9209 8.60648 12.3629 9.10852 12.0502 9.64855L12.6992 10.0244L13.3482 10.4003C13.4953 10.1463 13.6992 10.0147 13.8653 9.99223L13.7646 9.24902ZM12.6992 10.0244L12.0501 9.64875C11.7345 10.194 11.5848 10.9243 11.8685 11.6165L12.5625 11.332L13.2565 11.0476C13.1914 10.8889 13.2033 10.6507 13.3484 10.4001L12.6992 10.0244ZM12.5625 11.332L11.8682 11.6157C12.0875 12.1524 11.8767 12.7687 11.3749 13.0585L11.75 13.708L12.1251 14.3575C13.2766 13.6925 13.7596 12.279 13.2568 11.0483L12.5625 11.332ZM11.75 13.708L11.375 13.0585C10.873 13.3483 10.2331 13.2226 9.87803 12.7643L9.28516 13.2236L8.69228 13.683C9.50671 14.7342 10.9733 15.0224 12.125 14.3575L11.75 13.708ZM9.28516 13.2236L9.87834 12.7647C9.42214 12.1751 8.72176 11.9395 8.09063 11.9404L8.0918 12.6904L8.09296 13.4404C8.37938 13.44 8.58668 13.5465 8.69197 13.6826L9.28516 13.2236ZM8.0918 12.6904V11.9404H8.07324V12.6904V13.4404H8.0918V12.6904ZM8.07324 12.6904L8.07475 11.9404C7.44357 11.9392 6.7428 12.1752 6.2872 12.7653L6.88086 13.2236L7.47452 13.682C7.57921 13.5464 7.78609 13.4399 8.07174 13.4404L8.07324 12.6904ZM6.88086 13.2236L6.28798 12.7643C5.93291 13.2226 5.29304 13.3483 4.791 13.0585L4.41602 13.708L4.04103 14.3575C5.19271 15.0224 6.6593 14.7342 7.47373 13.683L6.88086 13.2236ZM4.41602 13.708L4.79108 13.0585C4.28932 12.7688 4.0785 12.1525 4.2978 11.6157L3.60352 11.332L2.90923 11.0484C2.40645 12.279 2.88939 13.6925 4.04095 14.3575L4.41602 13.708ZM3.60352 11.332L4.29816 11.6148C4.57898 10.925 4.43384 10.1998 4.11675 9.65238L3.46777 10.0283L2.8188 10.4043C2.96249 10.6523 2.97466 10.8876 2.90887 11.0492L3.60352 11.332ZM3.46777 10.0283L4.11672 9.65234C4.11712 9.65302 4.11718 9.65313 4.11587 9.65083C4.11502 9.64934 4.11254 9.64496 4.11001 9.64057L3.45996 10.0146L2.80991 10.3887C2.80983 10.3886 2.8099 10.3887 2.81025 10.3893C2.81067 10.3901 2.81102 10.3907 2.81186 10.3921C2.81315 10.3944 2.81582 10.3991 2.81882 10.4043L3.46777 10.0283ZM3.45996 10.0146L4.11004 9.64062C3.79488 9.09287 3.23919 8.60581 2.50218 8.50583L2.40137 9.24902L2.30055 9.99222C2.47159 10.0154 2.66804 10.1422 2.80988 10.3887L3.45996 10.0146ZM2.40137 9.24902L2.5027 8.5059C1.92848 8.4276 1.50015 7.93699 1.5 7.35723L0.75 7.35742L0 7.35761C0.000342309 8.68706 0.982458 9.81248 2.30003 9.99215L2.40137 9.24902ZM0.75 7.35742H1.5C1.5 6.77731 1.92862 6.28626 2.50271 6.20797L2.40137 5.46484L2.30003 4.72172C0.982011 4.90146 1.19209e-07 6.02791 0 7.35742H0.75ZM2.40137 5.46484L2.50314 6.20791C3.24012 6.10696 3.79467 5.6195 4.10977 5.07273L3.45996 4.69824L2.81015 4.32375C2.6675 4.57128 2.47089 4.69832 2.29959 4.72178L2.40137 5.46484ZM3.45996 4.69824L4.10977 5.07273C4.10741 5.07683 4.10559 5.07987 4.10478 5.08122C4.10406 5.08241 4.1036 5.08317 4.10442 5.08183C4.10484 5.08114 4.1067 5.0781 4.10864 5.07489C4.11071 5.07145 4.1138 5.0663 4.11737 5.06014L3.46875 4.68359L2.82013 4.30705C2.82229 4.30332 2.82392 4.30061 2.82453 4.29961C2.82499 4.29884 2.82535 4.29824 2.82428 4.3C2.82361 4.30111 2.82165 4.30431 2.81946 4.30794C2.81718 4.31174 2.81391 4.31722 2.81015 4.32375L3.45996 4.69824ZM3.46875 4.68359L4.11742 5.06006C4.43517 4.51257 4.57959 3.78716 4.2977 3.09792L3.60352 3.38184L2.90933 3.66575C2.97502 3.82637 2.96323 4.06048 2.82008 4.30712L3.46875 4.68359ZM3.60352 3.38184L4.29782 3.0982C4.07852 2.56139 4.28936 1.94506 4.79107 1.65535L4.41602 1.00586L4.04097 0.356369C2.88934 1.02138 2.40653 2.43495 2.90922 3.66547L3.60352 3.38184ZM4.41602 1.00586L4.79102 1.65538C5.2931 1.3655 5.93289 1.49123 6.28796 1.94955L6.88086 1.49023L7.47375 1.03091C6.65931 -0.0203766 5.19273 -0.3086 4.04102 0.35634L4.41602 1.00586ZM6.88086 1.49023L6.28808 1.94971C6.74396 2.53785 7.44394 2.77454 8.07553 2.77344L8.07422 2.02344L8.0729 1.27344C7.78765 1.27394 7.57943 1.16725 7.47364 1.03076L6.88086 1.49023ZM8.07422 2.02344V2.77344H8.09082V2.02344V1.27344H8.07422V2.02344ZM8.09082 2.02344L8.08979 2.77344C8.72145 2.7743 9.42097 2.53798 9.87746 1.95032L9.28516 1.49023L8.69286 1.03015C8.58642 1.16717 8.37783 1.27383 8.09185 1.27344L8.09082 2.02344ZM8.08301 5.35645V4.60645C6.56421 4.60645 5.33334 5.838 5.33301 7.35628L6.08301 7.35645L6.83301 7.35661C6.83316 6.66617 7.39297 6.10645 8.08301 6.10645V5.35645ZM6.08301 7.35645H5.33301C5.33301 8.87523 6.56422 10.1064 8.08301 10.1064V9.35645V8.60645C7.39265 8.60645 6.83301 8.0468 6.83301 7.35645H6.08301ZM8.08301 9.35645V10.1064C9.60179 10.1064 10.833 8.87523 10.833 7.35645H10.083H9.33301C9.33301 8.0468 8.77336 8.60645 8.08301 8.60645V9.35645ZM10.083 7.35645L10.833 7.35628C10.8327 5.838 9.60181 4.60645 8.08301 4.60645V5.35645V6.10645C8.77305 6.10645 9.33286 6.66617 9.33301 7.35661L10.083 7.35645Z" fill="#00050A" />
  </svg>
)
const IconTeam = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M12.5 8.33268C14.3409 8.33268 15.8333 6.8403 15.8333 4.99935C15.8333 3.1584 14.3409 1.66602 12.5 1.66602" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6.66665" cy="4.99935" r="3.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0.833313 14.9993C0.833313 13.1584 2.3257 11.666 4.16665 11.666H9.16664C11.0076 11.666 12.5 13.1584 12.5 14.9993V14.9993C12.5 16.8403 11.0076 18.3327 9.16665 18.3327H4.16665C2.3257 18.3327 0.833313 16.8403 0.833313 14.9993V14.9993Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.1667 18.3327H16.5C17.9728 18.3327 19.1667 17.1388 19.1667 15.666C19.1667 13.4569 17.3758 11.666 15.1667 11.666H14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconClockSidebar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconChat = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0 block">
    <path d="M10 0.917969C15.0163 0.918145 19.0838 4.98465 19.084 10.001C19.0838 15.0173 15.0163 19.0848 10 19.085C8.97617 19.0849 8.07457 18.9377 7.22754 18.6348C6.86937 18.5066 6.60549 18.4121 6.41406 18.3457C6.31862 18.3126 6.24418 18.2884 6.18848 18.2705C6.16125 18.2618 6.13997 18.2547 6.12402 18.25C6.11634 18.2478 6.10973 18.2462 6.10547 18.2451C6.10257 18.2443 6.10036 18.2435 6.09961 18.2432C5.69406 18.1479 5.42764 18.2253 5.08789 18.3867C4.76636 18.5396 4.1972 18.8901 3.51465 19.0039C2.49746 19.1732 1.59253 18.3402 1.67676 17.3125C1.70767 16.9368 1.84949 16.6047 1.95508 16.3711C2.07883 16.0973 2.15469 15.9502 2.2002 15.792C2.38122 15.1617 2.16846 14.7093 1.75391 13.8145C1.21645 12.6542 0.91704 11.3612 0.916992 10.001C0.917168 4.98465 4.98367 0.918144 10 0.917969ZM6.66699 9.16797C6.20675 9.16797 5.83301 9.54074 5.83301 10.001C5.83301 10.4612 6.20675 10.834 6.66699 10.834C7.12708 10.8338 7.5 10.4611 7.5 10.001C7.5 9.54085 7.12708 9.16814 6.66699 9.16797ZM10 9.16797C9.53976 9.16797 9.16699 9.54074 9.16699 10.001C9.16699 10.4612 9.53976 10.834 10 10.834C10.4602 10.834 10.833 10.4612 10.833 10.001C10.833 9.54074 10.4602 9.16797 10 9.16797ZM13.333 9.16797C12.8729 9.16814 12.5 9.54085 12.5 10.001C12.5 10.4611 12.8729 10.8338 13.333 10.834C13.7932 10.834 14.167 10.4612 14.167 10.001C14.167 9.54074 13.7932 9.16797 13.333 9.16797Z" fill="currentColor" />
  </svg>
)
const IconDollar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M13.3334 2.35942C12.3126 1.91343 11.1852 1.66602 10 1.66602C5.39765 1.66602 1.66669 5.39698 1.66669 9.99935C1.66669 14.6017 5.39765 18.3327 10 18.3327C14.6024 18.3327 18.3334 14.6017 18.3334 9.99935C18.3334 8.12297 17.7132 6.39144 16.6667 4.99854M7.49992 11.666C7.49992 12.5865 8.24611 13.3327 9.16659 13.3327H11.0471C11.8495 13.3327 12.4999 12.6822 12.4999 11.8798C12.4999 11.2545 12.0998 10.6993 11.5065 10.5015L8.49333 9.49715C7.90008 9.2994 7.49992 8.74421 7.49992 8.11886C7.49992 7.31648 8.15038 6.66602 8.95276 6.66602H10.8333C11.7537 6.66602 12.4999 7.41221 12.4999 8.33268M9.99992 5.41602V14.5827" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="9.99935" r="8.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconFlagUK = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="13" viewBox="0 0 19 13" fill="none" className="shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M1.95029 -1.25H0V1.25L16.3725 13.75L18.3333 13.75V11.25L1.95029 -1.25Z" fill="white" />
    <path d="M0.650483 -1.25L18.3333 12.2854V13.75L17.6981 13.75L0 0.200559V-1.25H0.650483Z" fill="#F93939" />
    <path fillRule="evenodd" clipRule="evenodd" d="M16.5873 -1.25H18.3333V1.25C18.3333 1.25 6.99269 9.57806 1.74603 13.75H0V11.25L16.5873 -1.25Z" fill="white" />
    <path d="M18.3333 -1.25H17.7412L0 12.2971V13.75H0.650483L18.3333 0.211513V-1.25Z" fill="#F93939" />
    <path fillRule="evenodd" clipRule="evenodd" d="M6.66729 -1.25H11.6813V3.37682H18.3333V9.12013H11.6813V13.75H6.66729V9.12013H0V3.37682H6.66729V-1.25Z" fill="white" />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.7193 -1.25H10.614V4.51923H18.3333V7.98077H10.614V13.75H7.7193V7.98077H0V4.51923H7.7193V-1.25Z" fill="#F93939" />
  </svg>
)
const IconTruck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M1 4h6v8H1V4zM7 6h2l3 3v3H7V6zM10 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="4" cy="12" r="1" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
const IconLightbulb = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M6 14h4M8 12v-1M5.5 6.5a3 3 0 015 0c0 .8-.3 1.5-.7 2.1L8 9.5V11M8 2v1M3 5l.7.7M12.3 5.7L13 5M4 9H3M13 9h-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8 3a3.5 3.5 0 00-2.5 5.9v.6c0 .3.2.5.5.5h4c.3 0 .5-.2.5-.5v-.6A3.5 3.5 0 008 3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconCollapse = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
    <path d="M12 5l-5 5 5 5M7 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* Logo from Figma 145-914: 24px icon + wordmark, gap 6px. Assets use dark fill; invert for white on sidebar. */
function AutoneLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-[6px] h-6 [&_img]:invert ${className}`} data-name="autone-logo">
      <img src="/logo-icon.svg" alt="" className="w-6 h-6 shrink-0 block" aria-hidden />
      <img src="/logo-wordmark.svg" alt="autone" className="h-[24px] w-[112px] shrink-0 block" />
    </div>
  )
}

/* Top bar – Autone Design System 12301:65728 */
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconExternalLink = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M6 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V6M11 2h3v3M7 9l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
    <path d="M8 11V2M8 2l3 3M8 2L5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

function TopBar({ title = 'Team', subtitle = 'Manage permissions and invites throughout your team', primaryButtonLabel = '', primaryButtonHref = '#', onPrimaryClick, onBack }) {
  return (
    <header className="bg-[#12171e] flex items-center justify-between p-6 shrink-0" data-name="Top bar" data-node-id="12301:65733">
      <div className="flex flex-1 items-center gap-3 min-w-0">
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-[4px] text-white hover:bg-white/10 shrink-0" aria-label="Back">
            <IconArrowLeft className="text-white" />
          </button>
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="font-sans text-2xl font-medium text-white leading-tight">{title}</h1>
          {subtitle != null && subtitle !== '' && (
            <p className="font-sans text-sm font-normal text-[#878d94] leading-tight whitespace-nowrap">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex flex-1 gap-1.5 items-center justify-end min-w-0 shrink-0">
        {primaryButtonLabel && (
          onPrimaryClick
            ? (
                <button type="button" onClick={onPrimaryClick} className="bg-[#0267ff] flex items-center justify-center h-12 px-4 rounded-[4px] text-base font-medium text-white hover:bg-[#0252cc] shrink-0">
                  {primaryButtonLabel}
                </button>
              )
            : (
                <a href={primaryButtonHref} className="bg-[#0267ff] flex items-center justify-center h-12 px-4 rounded-[4px] text-base font-medium text-white hover:bg-[#0252cc] shrink-0">
                  {primaryButtonLabel}
                </a>
              )
        )}
      </div>
    </header>
  )
}

const WEEK_DAYS = [
  { day: 'Mon', date: 23, today: true, events: [] },
  { day: 'Tue', date: 24, today: false, events: [{ route: 'London → Manchester', units: '450 units', time: '10:00 AM', category: 'Athletic wear', priority: 'critical' }] },
  { day: 'Wed', date: 25, today: false, events: [
    { route: 'Birmingham → Edinburgh', units: '320 units', time: '2:00 PM', category: 'Accessories', priority: 'high' },
    { route: 'Leeds → London', units: '280 units', time: '4:30 PM', category: 'Spring collection', priority: 'critical' },
  ]},
  { day: 'Thu', date: 26, today: false, events: [{ route: 'Manchester → Birmingham', units: '195 units', time: '11:00 AM', category: 'Footwear', priority: 'medium' }] },
  { day: 'Fri', date: 27, today: false, events: [{ route: 'Edinburgh → Leeds', units: '380 units', time: '9:00 AM', category: 'Winter stock', priority: 'critical' }] },
  { day: 'Sat', date: 28, today: false, events: [{ route: 'London → Birmingham', units: '520 units', time: '1:00 PM', category: 'Outerwear', priority: 'high' }] },
  { day: 'Sun', date: 1, today: false, events: [] },
]

const ALERTS = [
  { type: 'critical', title: 'Data age - critical warning', badge: '41 hours', body: 'Your data has not been updated for 41 hours. Older data can cause multiple issues across the platform.' },
  { type: 'high', title: 'Recommendation - winter jackets', badge: '12% remaining', body: 'SKU #WJ-2024 is at 12% stock level in Northeast region' },
  { type: 'high', title: 'Recommendation - London flagship', badge: '-18% WoW', body: 'Week-over-week sales down 18% compared to last month' },
  { type: 'high', title: 'High return rate - summer dresses', badge: '24% returns', body: 'Return rate of 24% detected for SKU #SD-1245' },
]

const RECOMMENDATIONS = [
  { title: 'Increase order - athletic wear', body: 'Based on the forecast, increase next order by 35%', impact: '+£45K potential revenue' },
  { title: 'Redistribute inventory - accessories', body: 'Move 450 units from Manchester to Birmingham for better turnover', impact: '+22% faster sell-through' },
  { title: 'Markdown opportunity - spring collection', body: 'Apply 20% discount to clear slow-moving spring items before season end', impact: '£28K inventory clearance' },
]

const VALUE_CARDS = [
  { value: '127', unit: 'incidents', title: 'Stockouts avoided', body: 'Prevented out-of-stock situations this month', icon: IconShield, bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
  { value: '£248K', unit: 'saved', title: 'Cost savings', body: 'Avoided stockouts and overstock situations', icon: IconPound, bg: 'bg-green-50', iconBg: 'bg-green-100' },
  { value: '43%', unit: 'increase', title: 'Margin improvements', body: 'Enhanced profitability through optimized pricing', icon: IconChart, bg: 'bg-purple-50', iconBg: 'bg-purple-100' },
]

function EventCard({ route, units, time, category, priority }) {
  const styles = {
    critical: 'bg-red-50 border-l-4 border-red-500 text-red-900',
    high: 'bg-amber-50 border-l-4 border-amber-500 text-amber-900',
    medium: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900',
  }
  return (
    <div className={`rounded-lg p-2 text-xs ${styles[priority] || styles.medium}`}>
      <div className="font-medium">{route}</div>
      <div className="opacity-90">{units}</div>
      <div className="flex items-center gap-1 opacity-75">
        <IconClock />
        <span>{time}</span>
      </div>
      <div className="opacity-75">{category}</div>
    </div>
  )
}

/* Scope (Add Job) page – Products/Locations table */
const SCOPE_PRODUCTS = [
  { name: 'Ori-sac pte croise m', sku: 'A12528YY', color: 'Kaki fonce', transfers: [32, 8], sales: [33, 155], forecast: 15.54, revenue: '€15.1K', stockouts: [0, 2], locations: [7, 5], overstocks: [46, 16], understocks: [41, 9], dept: 20.0 },
  { name: 'Ori-sac pte croise m', sku: 'A1252810', color: 'Noir', transfers: [29, 7], sales: [61, 219], forecast: 28.22, revenue: '€12.1K', stockouts: [0, 1], locations: [6, 5], overstocks: [46, 25], understocks: [93, 64], dept: 27.2 },
  { name: 'Ori-sac hobo m', sku: 'A13314YY', color: 'Kaki fonce', transfers: [20, 6], sales: [19, 74], forecast: 10.71, revenue: '€9.94K', stockouts: [0, 0], locations: [5, 5], overstocks: [27, 7], understocks: [22, 2], dept: 14.4 },
  { name: 'Ninon-sac seau s', sku: 'A1092220', color: 'Camel', transfers: [28, 23], sales: [5, 35], forecast: 5.64, revenue: '€7.81K', stockouts: [15, 8], locations: [25, 32], overstocks: [31, 9], understocks: [29, 1], dept: 2.1 },
  { name: 'Hui-sac seau s', sku: 'A9307045', color: 'Bleu nuit', transfers: [16, 6], sales: [15, 82], forecast: 9.96, revenue: '€7.18K', stockouts: [0, 0], locations: [5, 5], overstocks: [32, 17], understocks: [21, 5], dept: 17.4 },
  { name: 'Ninon-sac rabat l', sku: 'A0922310', color: 'Noir', transfers: [22, 17], sales: [4, 21], forecast: 4.64, revenue: '€7.13K', stockouts: [15, 9], locations: [16, 22], overstocks: [18, 4], understocks: [25, 3], dept: 2.1 },
  { name: 'Ninon-sac seau s', sku: 'A1092210', color: 'Noir', transfers: [23, 19], sales: [3, 25], forecast: 5.12, revenue: '€6.54K', stockouts: [17, 16], locations: [19, 20], overstocks: [9, 1], understocks: [28, 5], dept: 1.4 },
]

function ScopePage() {
  const [activeTab, setActiveTab] = useState('products')
  const [tripType, setTripType] = useState('rebalancing')
  const [includeZeroTransfers, setIncludeZeroTransfers] = useState(true)
  return (
    <div className="pt-6 flex flex-col gap-6">
      <div className="rounded-[10px] overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
          <div className="flex gap-6">
            <button type="button" onClick={() => setActiveTab('products')} className={`text-[14px] font-medium pb-2 border-b-2 ${activeTab === 'products' ? 'text-[#0267ff] border-[#0267ff]' : 'text-[#4b535c] border-transparent'}`}>Products</button>
            <button type="button" onClick={() => setActiveTab('locations')} className={`text-[14px] font-medium pb-2 border-b-2 ${activeTab === 'locations' ? 'text-[#0267ff] border-[#0267ff]' : 'text-[#4b535c] border-transparent'}`}>Locations</button>
          </div>
          <div className="flex flex-col gap-4 ml-auto">
            <div className="flex items-center gap-4">
              <span className="text-[14px] text-[#4b535c]">Trip type:</span>
              <div className="flex rounded-[4px] border border-[#e5e7eb] bg-white overflow-hidden">
                <button type="button" onClick={() => setTripType('rebalancing')} className={`px-3 py-2 text-[14px] font-medium border-r border-[#e5e7eb] ${tripType === 'rebalancing' ? 'bg-[#f7f7f7] text-[#0a0a0a]' : 'text-[#4b535c] hover:bg-[#f9fafb] bg-white'}`}>Rebalancing</button>
                <button type="button" onClick={() => setTripType('replenishment')} className={`px-3 py-2 text-[14px] font-medium border-r border-[#e5e7eb] ${tripType === 'replenishment' ? 'bg-[#f7f7f7] text-[#0a0a0a]' : 'text-[#4b535c] hover:bg-[#f9fafb] bg-white'}`}>Replenishment</button>
                <button type="button" onClick={() => setTripType('reorder')} className={`px-3 py-2 text-[14px] font-medium ${tripType === 'reorder' ? 'bg-[#f7f7f7] text-[#0a0a0a]' : 'text-[#4b535c] hover:bg-[#f9fafb] bg-white'}`}>Reorder</button>
              </div>
              <div className="w-px h-6 bg-[#e5e7eb]" aria-hidden />
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#4b535c]">Include zero transfers</span>
                <button type="button" onClick={() => setIncludeZeroTransfers((v) => !v)} className={`relative w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${includeZeroTransfers ? 'bg-[#0267ff]' : 'bg-[#e5e7eb]'}`} aria-pressed={includeZeroTransfers}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${includeZeroTransfers ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center h-10 w-[240px] rounded-[4px] border border-[#e9eaeb] bg-white pl-3 pr-3">
                <IconSearch className="text-[#4b535c] shrink-0" />
                <input type="text" placeholder="Search..." className="flex-1 min-w-0 pl-2 border-0 bg-transparent text-[14px] text-[#0a0a0a] outline-none placeholder:text-[#4b535c]" />
              </div>
              <button type="button" className="flex items-center justify-center gap-2 h-10 px-4 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#22272f] shrink-0">
                Revenue increase
                <IconChevronDown className="shrink-0 text-[#22272f] size-4" aria-hidden />
              </button>
              <button type="button" className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white text-[#22272f] hover:bg-[#f3f4f6] shrink-0" aria-label="Settings">
                <IconGears className="size-5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-[14px]">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#F8F8F8]">
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Product details</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Transfers</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Sales</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Forecast</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Revenue increase</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Stockouts</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Locations</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Overstocks</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Understocks</th>
                <th className="text-left py-3 px-4 font-medium text-[#0a0a0a] bg-[#F8F8F8]">Dept</th>
              </tr>
              <tr className="border-b border-[#e5e7eb] bg-[#F8F8F8]">
                <th className="text-left py-2 px-4 bg-[#F8F8F8]" />
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">3,220 units · 113 trips</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">991 L7D · 5,468 L30D</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">1077.84</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">€661.8K</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">38,598 → 37,855</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">61 → 61</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">5,566 → 2,930</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">4,846 → 1,672</th>
                <th className="text-left py-2 px-4 text-[12px] font-normal text-[#4b535c] bg-[#F8F8F8]">0.6</th>
              </tr>
            </thead>
            <tbody>
              {SCOPE_PRODUCTS.map((row, i) => (
                <tr key={i} className="border-b border-[#e5e7eb] bg-[#ffffff] hover:bg-[#f9fafb]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[4px] bg-[#f3f4f6] shrink-0" aria-hidden />
                      <div>
                        <p className="font-medium text-[#0a0a0a]">{row.name}</p>
                        <p className="text-[12px] text-[#4b535c]">{row.sku} · {row.color}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.transfers[0]} · {row.transfers[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.sales[0]} · {row.sales[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.forecast}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.revenue}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.stockouts[0]} → {row.stockouts[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.locations[0]} → {row.locations[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.overstocks[0]} → {row.overstocks[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.understocks[0]} → {row.understocks[1]}</td>
                  <td className="py-3 px-4 text-[#0a0a0a]">{row.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* Sample calendar entries – Replenishment Feb 2–4, Reorder Feb 15–17 2026 */
const SAMPLE_CALENDAR_ENTRY = {
  id: 'entry-1',
  type: 'replenishment',
  title: 'Replenishment',
  startDate: new Date(2026, 1, 2),
  endDate: new Date(2026, 1, 4),
  module: 'Replenishment Module',
  from: 'Warehouse A',
  to: 'Store B',
  time: '09:00 AM PST',
  frequency: 'Weekly · Mon, Wed, Fri',
  transferUnits: 100,
  availableToSend: 150,
  tripType: 'Truck',
  recommendedUnits: 120,
  revenueIncrease: 500,
  reasons: ['High demand', 'Low inventory'],
}
const SAMPLE_CALENDAR_ENTRY_REORDER = {
  id: 'entry-2',
  type: 'reorder',
  title: 'Reorder',
  startDate: new Date(2026, 1, 15),
  endDate: new Date(2026, 1, 17),
  module: 'Reorder Module',
  from: 'Distribution Center',
  to: 'Store C',
  time: '10:00 AM PST',
  frequency: 'Weekly · Tue, Thu',
  transferUnits: 80,
  availableToSend: 120,
  tripType: 'Van',
  recommendedUnits: 90,
  revenueIncrease: 320,
  reasons: ['Stock level below threshold', 'Seasonal demand'],
}
const SAMPLE_CALENDAR_ENTRY_REBALANCING_1 = {
  id: 'entry-3',
  type: 'rebalancing',
  title: 'Rebalancing',
  startDate: new Date(2026, 1, 9),
  endDate: new Date(2026, 1, 9),
  module: 'Rebalancing Module',
  from: 'Store A',
  to: 'Store B',
  time: '08:00 AM PST',
  frequency: 'Weekly · Mon',
  transferUnits: 50,
  availableToSend: 200,
  tripType: 'Truck',
  recommendedUnits: 55,
  revenueIncrease: 180,
  reasons: ['Inventory imbalance', 'Regional demand shift'],
}
const SAMPLE_CALENDAR_ENTRY_REBALANCING_2 = {
  id: 'entry-4',
  type: 'rebalancing',
  title: 'Rebalancing',
  startDate: new Date(2026, 1, 20),
  endDate: new Date(2026, 1, 21),
  module: 'Rebalancing Module',
  from: 'Warehouse B',
  to: 'Store D',
  time: '02:00 PM PST',
  frequency: 'Bi-weekly · Thu',
  transferUnits: 120,
  availableToSend: 300,
  tripType: 'Truck',
  recommendedUnits: 130,
  revenueIncrease: 420,
  reasons: ['Overstock at origin', 'Understock at destination'],
}
const SAMPLE_CALENDAR_ENTRY_REBALANCING_3 = {
  id: 'entry-5',
  type: 'rebalancing',
  title: 'Rebalancing',
  startDate: new Date(2026, 1, 26),
  endDate: new Date(2026, 1, 27),
  module: 'Rebalancing Module',
  from: 'Distribution Center',
  to: 'Store A',
  time: '11:00 AM PST',
  frequency: 'Monthly',
  transferUnits: 200,
  availableToSend: 500,
  tripType: 'Truck',
  recommendedUnits: 220,
  revenueIncrease: 650,
  reasons: ['End of month rebalance', 'Forecast adjustment'],
}
const CALENDAR_ENTRIES = [
  SAMPLE_CALENDAR_ENTRY,
  SAMPLE_CALENDAR_ENTRY_REORDER,
  SAMPLE_CALENDAR_ENTRY_REBALANCING_1,
  SAMPLE_CALENDAR_ENTRY_REBALANCING_2,
  SAMPLE_CALENDAR_ENTRY_REBALANCING_3,
]

/* Optimiser page – Figma 174:2696 (Optimiser-Concepts) */
const DEFAULT_DRAWER_FORM = {
  module: '',
  modules: [],
  name: '',
  sending: '',
  receiving: '',
  repeats: 'biweekly',
  time: '',
  timeZone: 'gmt+1',
  endsOn: '',
  notify: '',
}
const MODULE_OPTIONS = [
  { id: 'replenishment', label: 'Replenishment' },
  { id: 'reorder', label: 'Reorder' },
  { id: 'rebalancing', label: 'Rebalancing' },
]

function OptimiserPage({ onAddJob }) {
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false)
  const [editingScheduleEntry, setEditingScheduleEntry] = useState(null)
  const [drawerForm, setDrawerForm] = useState(DEFAULT_DRAWER_FORM)
  const [scheduleDrawerDays, setScheduleDrawerDays] = useState(() => ({ Wed: true, Sat: true }))
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false)
  const [entryReviewStatus, setEntryReviewStatus] = useState(() => ({
    'entry-1': 'upcoming',   // Replenishment
    'entry-2': 'in review', // Reorder
    'entry-3': 'submitted', // Rebalancing (Feb 9)
    'entry-4': 'in review', // Rebalancing (Feb 20–21)
    'entry-5': 'upcoming',  // Rebalancing (Feb 26–27)
  }))
  const setReviewStatus = (entryId, status) => setEntryReviewStatus((prev) => ({ ...prev, [entryId]: status }))
  const [activeTypeFilter, setActiveTypeFilter] = useState('all')
  const [pinnedHoverEntryId, setPinnedHoverEntryId] = useState(null)
  const [pinnedHoverCellKey, setPinnedHoverCellKey] = useState(null)
  const [hoveredEntryId, setHoveredEntryId] = useState(null)
  const [hoveredCellKey, setHoveredCellKey] = useState(null)
  const hoverLeaveTimeoutRef = useRef(null)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const toggleScheduleDay = (day) => setScheduleDrawerDays((prev) => ({ ...prev, [day]: !prev[day] }))
  const typeFilters = [
    { id: 'all', label: 'All', icon: null },
    { id: 'replenishment', label: 'Replenishment', icon: 'replenishment' },
    { id: 'reorder', label: 'Reorder', icon: 'reorder' },
    { id: 'rebalancing', label: 'Rebalancing', icon: 'rebalancing' },
  ]
  const [activeViewOption, setActiveViewOption] = useState('month')
  const [viewDate, setViewDate] = useState(() => new Date(2026, 1, 1)) // Feb 2026
  const [eventDatePickerOpen, setEventDatePickerOpen] = useState(false)
  const [eventDateSelected, setEventDateSelected] = useState(() => new Date(2026, 1, 26))
  const [eventDatePickerViewDate, setEventDatePickerViewDate] = useState(() => new Date(2026, 1, 1))
  const [selectedReviewStatuses, setSelectedReviewStatuses] = useState([])
  const [reviewStatusDropdownOpen, setReviewStatusDropdownOpen] = useState(false)
  const reviewStatusFilterOptions = [
    { id: 'in review', label: 'In review' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'submitted', label: 'Submitted' },
  ]
  const toggleReviewStatusFilter = (id) => {
    setSelectedReviewStatuses((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }
  const viewOptions = [
    { id: 'list', label: 'List', icon: 'list' },
    { id: 'week', label: 'Week', icon: 'week' },
    { id: 'month', label: 'Month', icon: 'month' },
  ]
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const getMonday = (d) => {
    const x = new Date(d)
    x.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return x
  }
  const monthGrid = (() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    const start = getMonday(first)
    const weeks = []
    let d = new Date(start)
    while (weeks.length < 6) {
      const row = []
      for (let i = 0; i < 7; i++) {
        row.push(d.getMonth() === m ? d.getDate() : null)
        d.setDate(d.getDate() + 1)
      }
      weeks.push(row)
      if (d > last) break
    }
    return weeks
  })()
  const weekRow = (() => {
    const mon = getMonday(new Date(viewDate))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      return d
    })
  })()
  const listMonthDates = (() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const last = new Date(y, m + 1, 0).getDate()
    return Array.from({ length: last }, (_, i) => i + 1)
  })()
  const viewTitle = activeViewOption === 'month' || activeViewOption === 'list'
    ? `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`
    : (() => {
        const mon = weekRow[0]
        const sun = weekRow[6]
        return `Week of ${mon.getDate()} ${monthNames[mon.getMonth()]} – ${sun.getDate()} ${monthNames[sun.getMonth()]} ${sun.getFullYear()}`
      })()
  const goPrev = () => {
    if (activeViewOption === 'week') {
      setViewDate((d) => { const x = new Date(d); x.setDate(d.getDate() - 7); return x })
    } else {
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    }
  }
  const goNext = () => {
    if (activeViewOption === 'week') {
      setViewDate((d) => { const x = new Date(d); x.setDate(d.getDate() + 7); return x })
    } else {
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    }
  }
  const getCellDate = (ri, ci) => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const start = getMonday(new Date(y, m, 1))
    const d = new Date(start)
    d.setDate(start.getDate() + ri * 7 + ci)
    return d
  }
  const entryMatchesCell = (ri, ci, entry) => {
    const cellDate = getCellDate(ri, ci)
    return cellDate >= entry.startDate && cellDate <= entry.endDate && cellDate.getMonth() === entry.startDate.getMonth()
  }
  const getEntriesForCell = (ri, ci) => CALENDAR_ENTRIES.filter((e) => entryMatchesCell(ri, ci, e))
  const openDrawerForEdit = (entry) => {
    const e = entry || SAMPLE_CALENDAR_ENTRY
    setPinnedHoverEntryId(null)
    setEditingScheduleEntry(e)
    setDrawerForm({
      module: e.type || 'replenishment',
      modules: e.type ? [e.type] : [],
      name: e.title,
      sending: e.from,
      receiving: e.to,
      repeats: 'weekly',
      time: e.time.replace(/\s+PST$/, ''),
      timeZone: 'pst',
      endsOn: `${monthNames[e.endDate.getMonth()]} ${e.endDate.getDate()}, ${e.endDate.getFullYear()}`,
      notify: '',
    })
    setScheduleDrawerDays({ Mon: true, Tue: false, Wed: true, Thu: false, Fri: true, Sat: false, Sun: false })
    setScheduleDrawerOpen(true)
  }
  const closeDrawer = () => {
    setScheduleDrawerOpen(false)
    setEditingScheduleEntry(null)
    setModuleDropdownOpen(false)
  }
  const toggleModule = (id) => {
    setDrawerForm((f) => ({
      ...f,
      modules: f.modules.includes(id) ? f.modules.filter((m) => m !== id) : [...f.modules, id],
    }))
  }
  const eventDatePickerGrid = (() => {
    const y = eventDatePickerViewDate.getFullYear()
    const m = eventDatePickerViewDate.getMonth()
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    const start = getMonday(first)
    const rows = []
    let d = new Date(start)
    for (let row = 0; row < 6; row++) {
      const cells = []
      for (let col = 0; col < 7; col++) {
        cells.push({ date: d.getDate(), month: d.getMonth(), fullDate: new Date(d) })
        d.setDate(d.getDate() + 1)
      }
      rows.push(cells)
    }
    return rows
  })()
  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const eventDatePickerPrevMonth = () => setEventDatePickerViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const eventDatePickerNextMonth = () => setEventDatePickerViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <div className="flex flex-col gap-6">
      {pinnedHoverEntryId && (
        <div role="presentation" className="fixed inset-0 z-40" onClick={() => { setPinnedHoverEntryId(null); setPinnedHoverCellKey(null) }} aria-hidden />
      )}
      <div className="flex flex-col gap-6" data-name="Optimiser" data-node-id="174:2696">
        <div className="bg-white border border-[#ebf3ff] rounded-[14px] p-6 flex flex-col gap-5" data-name="Calendar container" data-node-id="174:2767">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <IconCalendarSidebar className="text-[#22272f] size-6 shrink-0" />
            <div>
              <p className="text-[16px] font-medium text-[#0a0a0a] leading-tight">Optimiser schedule</p>
              <p className="text-[14px] font-normal text-[#4b535c]">Perform all job and schedule actions for all your upcoming inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onAddJob?.() }}
            className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium flex items-center gap-2 shrink-0"
          >
            <IconPlus />
            Add Job
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingScheduleEntry(null)
              setDrawerForm(DEFAULT_DRAWER_FORM)
              setScheduleDrawerDays({ Wed: true, Sat: true })
              setScheduleDrawerOpen(true)
            }}
            className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium flex items-center gap-2 shrink-0"
          >
            <IconPlus />
            Add Schedule
          </button>
        </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="bg-white border border-[#e9eaeb] flex gap-[var(--spacing-s,8px)] items-center p-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] shrink-0 h-12" data-name="segment-control" data-node-id="202:3165">
            {typeFilters.map((f) => {
              const isActive = activeTypeFilter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveTypeFilter(f.id)}
                  className={`flex gap-[var(--spacing-xs,6px)] items-center justify-center max-h-[32px] p-[var(--spacing-s,8px)] rounded-[2px] shrink-0 text-[14px] text-center whitespace-nowrap ${isActive ? 'bg-[#f8f8f8] font-medium text-[#0a0a0a]' : 'font-normal text-[#4b535c]'}`}
                  data-name="Segment element"
                >
                  {f.icon === 'replenishment' && <IconReplenishment className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                  {f.icon === 'reorder' && <IconReorder className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                  {f.icon === 'rebalancing' && <IconRebalancing className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                  <span>{f.label}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
          <div className="flex items-center gap-2 relative" data-name="Review status multiselect" data-node-id="12771:5757">
            <button
              type="button"
              onClick={() => { setReviewStatusDropdownOpen((o) => !o); setEventDatePickerOpen(false) }}
              className={`flex items-center justify-between gap-2 h-12 px-4 py-3 rounded-[4px] bg-white text-[16px] font-medium text-left shrink-0 min-w-[160px] border ${reviewStatusDropdownOpen ? 'border-[#0267ff]' : 'border-[#e9eaeb]'}`}
            >
              <span className={selectedReviewStatuses.length === 0 ? 'text-[#0a0a0a]' : 'text-[#0a0a0a]'}>
                Review status
                {selectedReviewStatuses.length > 0 && (
                  <span className="text-[#4b535c] font-normal">
                    {' · '}
                    {selectedReviewStatuses.length === reviewStatusFilterOptions.length
                      ? 'Upcoming, In review, Submitted'
                      : reviewStatusFilterOptions.filter((o) => selectedReviewStatuses.includes(o.id)).map((o) => o.label).join(', ')}
                  </span>
                )}
              </span>
              <IconChevronDown className="text-[#22272f] size-4 shrink-0" aria-hidden />
            </button>
            {reviewStatusDropdownOpen && (
              <>
                <div role="presentation" className="fixed inset-0 z-40" onClick={() => setReviewStatusDropdownOpen(false)} aria-hidden />
                <div
                  className="absolute left-0 top-full mt-1 z-50 w-full min-w-[200px] bg-white border border-[#e9eaeb] rounded-[4px] p-2 shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)]"
                  data-name="Dropdown list"
                  data-node-id="12771:5850"
                >
                  {reviewStatusFilterOptions.map((opt) => {
                    const selected = selectedReviewStatuses.includes(opt.id)
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleReviewStatusFilter(opt.id)}
                        className="w-full flex gap-2 items-center p-3 rounded-[3px] text-left hover:bg-[#f8f8f8] focus:bg-[#f8f8f8]"
                        data-name="Dropdown item"
                      >
                        <span className="flex items-center justify-center shrink-0 size-6">
                          <span className={`flex items-center justify-center rounded-[4px] size-5 border-2 ${selected ? 'bg-[#0267ff] border-[#0267ff]' : 'bg-white border-[#e5e7eb]'}`}>
                            {selected && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            )}
                          </span>
                        </span>
                        <span className="flex-1 text-[12px] font-medium text-[#0a0a0a] leading-normal">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              type="button"
              onClick={() => { setEventDatePickerOpen((o) => !o); setEventDatePickerViewDate(eventDateSelected || new Date(2026, 1, 1)); setReviewStatusDropdownOpen(false) }}
              className="flex items-center gap-[var(--spacing-s,8px)] h-12 px-[var(--spacing-l,16px)] py-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] bg-white border border-[#e9eaeb] text-[16px] font-medium text-[#0a0a0a] shrink-0"
              data-name="Button"
              data-node-id="202:3228"
            >
              <IconCalendarSidebar className="text-[#22272f] size-4 shrink-0" aria-hidden data-name="icon" data-node-id="I202:3228;12027:34152" />
              <span data-node-id="I202:3228;12027:34153">Event Date</span>
            </button>
            {eventDatePickerOpen && (
              <>
                <div role="presentation" className="fixed inset-0 z-40" onClick={() => setEventDatePickerOpen(false)} aria-hidden />
                <div className="absolute left-0 top-full mt-2 z-50 w-[336px] bg-white border border-[#e9eaeb] rounded-[4px] p-4 flex flex-col gap-3 shadow-lg" data-name="Datepicker" data-node-id="2360:105506">
                  <div className="flex items-center justify-between p-1">
                    <button type="button" onClick={eventDatePickerPrevMonth} className="flex items-center justify-center h-10 w-10 rounded-[4px] text-[#0a0a0a] hover:bg-[#f3f4f6]" aria-label="Previous month">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <p className="text-[18px] font-medium text-[#0a0a0a] leading-none">
                      {monthNames[eventDatePickerViewDate.getMonth()]}, {eventDatePickerViewDate.getFullYear()}
                    </p>
                    <button type="button" onClick={eventDatePickerNextMonth} className="flex items-center justify-center h-10 w-10 rounded-[4px] text-[#0a0a0a] hover:bg-[#f3f4f6]" aria-label="Next month">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                  <div className="flex flex-col gap-0">
                    <div className="grid grid-cols-7">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((wd) => (
                        <div key={wd} className="size-12 flex items-center justify-center text-[14px] font-medium text-[#4b535c]">
                          {wd}
                        </div>
                      ))}
                    </div>
                    {eventDatePickerGrid.map((row, ri) => (
                      <div key={ri} className="grid grid-cols-7">
                        {row.map((cell, ci) => {
                          const inMonth = cell.month === eventDatePickerViewDate.getMonth()
                          const selected = isSameDay(cell.fullDate, eventDateSelected)
                          return (
                            <div key={`${ri}-${ci}`} className="size-12 flex items-center justify-center p-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEventDateSelected(cell.fullDate)
                                  setViewDate(new Date(cell.fullDate.getFullYear(), cell.fullDate.getMonth(), 1))
                                  setEventDatePickerOpen(false)
                                }}
                                className={`size-10 flex items-center justify-center rounded-[2px] text-[14px] ${selected ? 'bg-[#0267ff] text-white font-bold' : inMonth ? 'text-[#0a0a0a] hover:bg-[#f3f4f6]' : 'text-[#4b535c] opacity-50 hover:bg-[#f3f4f6]'}`}
                              >
                                {cell.date}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
            <div className="bg-white border border-[#e9eaeb] flex gap-[var(--spacing-s,8px)] items-center p-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] shrink-0 h-12" data-name="segment-control" data-node-id="203:1343">
              {viewOptions.map((v) => {
                const isActive = activeViewOption === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveViewOption(v.id)}
                    className={`flex gap-[var(--spacing-xs,6px)] items-center justify-center max-h-[32px] p-[var(--spacing-s,8px)] rounded-[2px] shrink-0 text-[14px] text-center whitespace-nowrap ${isActive ? 'bg-[#f8f8f8] font-medium text-[#0a0a0a]' : 'font-normal text-[#4b535c]'}`}
                    data-name="Segment element"
                  >
                    {v.icon === 'list' && <IconList className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                    {v.icon === 'week' && <IconCalendarNote className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                    {v.icon === 'month' && <IconCalendarSidebar className="text-[#22272f] size-4 shrink-0" aria-hidden />}
                    <span>{v.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 h-7">
            <button type="button" onClick={goPrev} className="rounded size-7 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f3f4f6]" aria-label={activeViewOption === 'week' ? 'Previous week' : 'Previous month'}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h2 className="text-[20px] font-semibold text-[#0a0a0a] tracking-tight">{viewTitle}</h2>
            <button type="button" onClick={goNext} className="rounded size-7 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f3f4f6]" aria-label={activeViewOption === 'week' ? 'Next week' : 'Next month'}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          {activeViewOption === 'month' && (
            <div className="border border-[#e5e7eb] rounded-[10px] overflow-visible relative">
              <div className="grid grid-cols-7 bg-[#f3f4f6] border-b border-[#e5e7eb]">
                {weekDays.map((day) => (
                  <div key={day} className="py-3 text-center text-[14px] font-medium text-[#364153] border-r border-[#e5e7eb] last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthGrid.map((row, ri) =>
                  row.map((date, ci) => {
                    const rawCellEntries = date !== null ? getEntriesForCell(ri, ci) : []
                    const byReview =
                      selectedReviewStatuses.length === 0
                        ? rawCellEntries
                        : rawCellEntries.filter((e) =>
                            selectedReviewStatuses.includes(entryReviewStatus[e.id] || 'upcoming')
                          )
                    const cellEntries = activeTypeFilter === 'all'
                      ? byReview
                      : byReview.filter((e) => e.type === activeTypeFilter)
                    const cellDate = getCellDate(ri, ci)
                    const isEventDate = eventDateSelected && isSameDay(cellDate, eventDateSelected)
                    const cellKey = `${ri}-${ci}`
                    return (
                      <div
                        key={`${ri}-${ci}`}
                        className={`min-h-[80px] p-2 border-b border-[#e5e7eb] text-[14px] text-[#0a0a0a] ${ci < 6 ? 'border-r' : ''} ${date === null ? 'text-[#9ca3af]' : ''} ${cellEntries.length > 0 ? 'cursor-pointer' : ''} ${isEventDate ? 'bg-[#ebf3ff] ring-2 ring-inset ring-[#0267ff]' : 'bg-white'}`}
                      >
                        {date ?? ''}
                        {cellEntries.map((entry) => {
                          const Icon = entry.type === 'reorder' ? IconReorder : entry.type === 'rebalancing' ? IconRebalancing : IconReplenishment
                          const reviewStatus = entryReviewStatus[entry.id] || 'upcoming'
                          const reviewLabel = reviewStatus === 'in review' ? 'In review' : reviewStatus === 'submitted' ? 'Submitted' : 'Upcoming'
                          const isPopoverOpen = (pinnedHoverEntryId === entry.id && pinnedHoverCellKey === cellKey) || (hoveredEntryId === entry.id && hoveredCellKey === cellKey && !pinnedHoverEntryId)
                          const clearHoverLater = () => {
                            if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current)
                            hoverLeaveTimeoutRef.current = setTimeout(() => { setHoveredEntryId(null); setHoveredCellKey(null) }, 150)
                          }
                          const setHovered = () => {
                            if (hoverLeaveTimeoutRef.current) {
                              clearTimeout(hoverLeaveTimeoutRef.current)
                              hoverLeaveTimeoutRef.current = null
                            }
                            setHoveredEntryId(entry.id)
                            setHoveredCellKey(cellKey)
                          }
                          return (
                            <div key={entry.id} className="relative group mt-1 w-fit">
                              <div
                                className={`px-2 py-1 rounded-[var(--Border-radius-m,6px)] border border-[var(--tokens-stroke-or-resting,#e9eaeb)] flex flex-col gap-1 w-fit shrink-0 cursor-pointer ${reviewStatus === 'in review' ? 'bg-[var(--tokens-destructive-50,#FFEAEA)]' : reviewStatus === 'submitted' ? 'bg-[var(--tokens-success-50,#E4F4EF)]' : 'bg-[var(--tokens-warning-50,#FFF6E5)]'}`}
                                onClick={() => {
                                  if (pinnedHoverEntryId === entry.id && pinnedHoverCellKey === cellKey) {
                                    setPinnedHoverEntryId(null)
                                    setPinnedHoverCellKey(null)
                                  } else {
                                    setPinnedHoverEntryId(entry.id)
                                    setPinnedHoverCellKey(cellKey)
                                  }
                                }}
                                onMouseEnter={setHovered}
                                onMouseLeave={clearHoverLater}
                              >
                                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--Tokens-Foreground,#00050A)]">
                                  <Icon className="size-3.5 shrink-0" aria-hidden />
                                  {entry.title}
                                </div>
                                <div className="flex items-center gap-[5px]">
                                  <span className="text-[12px] text-[#4b535c] leading-normal">Review</span>
                                  <span className="bg-white border border-[#bfd9ff] px-1 py-0.5 rounded-[5px] text-[12px] text-[#0a0a0a] leading-normal shrink-0">{reviewLabel}</span>
                                </div>
                              </div>
                              <div
                                role="dialog"
                                aria-label="Schedule details"
                                className={`absolute left-[100%] top-0 ml-2 w-[320px] rounded-[12px] bg-white border border-[#e9eaeb] shadow-lg overflow-hidden z-50 transition-opacity ${isPopoverOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                onMouseEnter={setHovered}
                                onMouseLeave={clearHoverLater}
                              >
                                <div className="p-4 flex flex-col gap-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[#ebf3ff] text-[#0267ff]">
                                        <Icon className="size-4" />
                                      </span>
                                      <div>
                                        <p className="text-[14px] font-semibold text-[#0a0a0a]">{entry.title}</p>
                                        <p className="text-[12px] text-[#4b535c]">
                                          {monthNames[entry.startDate.getMonth()]} {entry.startDate.getDate()} – {entry.endDate.getDate()}, {entry.endDate.getFullYear()}
                                        </p>
                                      </div>
                                    </div>
                                    <button type="button" onClick={() => openDrawerForEdit(entry)} className="shrink-0 h-8 px-3 rounded-[4px] text-[13px] font-medium text-[#0267ff] hover:bg-[#ebf3ff]">
                                      Edit schedule
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <p className="text-[12px] font-medium text-[#4b535c]">Review status</p>
                                    <p className="text-[14px] font-medium text-[#0a0a0a]">{reviewLabel}</p>
                                  </div>
                                  <div className="h-px bg-[#e9eaeb]" />
                                  <div className="flex items-center gap-2 text-[13px] text-[#0a0a0a]">
                                    <span className="text-[#4b535c]">{entry.from}</span>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#4b535c]"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="text-[#4b535c]">{entry.to}</span>
                                  </div>
                                  <p className="text-[13px] text-[#4b535c]">{entry.time}</p>
                                  <div className="h-px bg-[#e9eaeb]" />
                                  <div className="flex justify-between text-[13px]">
                                    <span className="text-[#4b535c]">Transfer units</span>
                                    <span className="text-[#0a0a0a] font-medium">{entry.transferUnits}</span>
                                  </div>
                                  <div className="flex justify-between text-[13px]">
                                    <span className="text-[#4b535c]">Available to send</span>
                                    <span className="text-[#0a0a0a] font-medium">{entry.availableToSend}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-[#4b535c]">Trip type</span>
                                    <span className="text-[#0a0a0a] font-medium flex items-center gap-1"><IconTruck className="size-3.5" /> {entry.tripType}</span>
                                  </div>
                                  <div className="h-px bg-[#e9eaeb]" />
                                  <div className="rounded-[8px] bg-[#eff6ff] p-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[13px]">
                                      <span className="text-[#4b535c]">Recommended units</span>
                                      <span className="text-[#0a0a0a] font-medium flex items-center gap-1"><IconTrendUp className="size-3.5" /> {entry.recommendedUnits}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px]">
                                      <span className="text-[#4b535c]">Revenue increase</span>
                                      <span className="font-medium text-[#059669]">${entry.revenueIncrease}</span>
                                    </div>
                                  </div>
                                  <div className="h-px bg-[#e9eaeb]" />
                                  <div className="flex items-start gap-2">
                                    <IconLightbulb className="size-4 text-[#4b535c] shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[13px] font-medium text-[#0a0a0a]">Recommendation reasons</p>
                                      <ul className="mt-1 text-[13px] text-[#4b535c] list-disc list-inside">
                                        {entry.reasons.map((r) => (
                                          <li key={r}>{r}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openDrawerForEdit(entry)}
                                    className="w-full h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium flex items-center justify-center gap-2 shrink-0"
                                  >
                                    <IconEdit />
                                    Edit Job
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
          {activeViewOption === 'week' && (
            <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden">
              <div className="grid grid-cols-7 bg-[#f3f4f6] border-b border-[#e5e7eb]">
                {weekDays.map((day) => (
                  <div key={day} className="py-3 text-center text-[14px] font-medium text-[#364153] border-r border-[#e5e7eb] last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {weekRow.map((d, i) => (
                  <div key={i} className="min-h-[80px] p-2 border-r border-[#e5e7eb] bg-white text-[14px] text-[#0a0a0a] last:border-r-0">
                    {d.getDate()}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeViewOption === 'list' && (
            <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden">
              <div className="bg-[#f3f4f6] border-b border-[#e5e7eb] py-3 px-4 text-[14px] font-medium text-[#364153]">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()} – list
              </div>
              <div className="divide-y divide-[#e5e7eb] bg-white">
                {listMonthDates.length === 0 ? (
                  <div className="py-8 px-4 text-[14px] text-[#4b535c] text-center">No schedules</div>
                ) : (
                  listMonthDates.map((date) => (
                    <div key={date} className="flex items-center gap-4 min-h-[48px] px-4 py-2 text-[14px] text-[#0a0a0a]">
                      <span className="font-medium w-8">{date}</span>
                      <span className="text-[#4b535c]">{monthNames[viewDate.getMonth()].slice(0, 3)}</span>
                      <span className="text-[#4b535c] flex-1">No schedule</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {scheduleDrawerOpen && (
        <>
          <div role="presentation" className="fixed inset-0 bg-black/50 z-40" onClick={closeDrawer} aria-hidden />
          <div className="fixed right-0 top-0 bottom-0 w-[800px] bg-white shadow-xl z-50 flex flex-col" role="dialog" aria-modal aria-labelledby="add-schedule-title" data-name={editingScheduleEntry ? 'Edit schedule' : 'Add Schedule'} data-node-id="214:2622">
            <header className="flex items-center justify-between shrink-0 h-14 px-6 border-b border-[#e9eaeb]">
              <h2 id="add-schedule-title" className="text-[18px] font-semibold text-[#0a0a0a]">{editingScheduleEntry ? 'Edit schedule' : 'Add Schedule'}</h2>
              <button type="button" onClick={closeDrawer} className="p-2 -mr-2 text-[#4b535c] hover:bg-[#f3f4f6] rounded-[4px]" aria-label="Close">
                <IconClose />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Choose module to create schedule <span className="font-normal text-[#4b535c]">Make a selection</span></p>
                <label className="text-[14px] font-normal text-[#4b535c]">Module</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setModuleDropdownOpen((o) => !o)}
                    className={`w-full h-10 flex items-center justify-between gap-2 px-3 rounded-[4px] border bg-white text-[14px] text-left ${moduleDropdownOpen ? 'border-[#0267ff]' : 'border-[#e9eaeb]'}`}
                    data-name="Input multiple select"
                    data-node-id="12770:4659"
                  >
                    <span className={drawerForm.modules.length === 0 ? 'text-[#4b535c]' : 'text-[#0a0a0a]'}>
                      {drawerForm.modules.length === 0
                        ? 'Select'
                        : drawerForm.modules.map((id) => MODULE_OPTIONS.find((o) => o.id === id)?.label).filter(Boolean).join(', ')}
                    </span>
                    <IconChevronDownSelect />
                  </button>
                  {moduleDropdownOpen && (
                    <>
                      <div role="presentation" className="fixed inset-0 z-[60]" onClick={() => setModuleDropdownOpen(false)} aria-hidden />
                      <div
                        className="absolute left-0 top-full mt-1 z-[70] w-full min-w-[200px] bg-white border border-[#e9eaeb] rounded-[4px] p-2 shadow-[0px_8px_25px_0px_rgba(0,0,0,0.12)]"
                        data-name="Dropdown list"
                        data-node-id="12771:5850"
                      >
                        {MODULE_OPTIONS.map((opt) => {
                          const selected = drawerForm.modules.includes(opt.id)
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleModule(opt.id)}
                              className="w-full flex gap-2 items-center p-3 rounded-[3px] text-left hover:bg-[#f8f8f8] focus:bg-[#f8f8f8]"
                              data-name="Dropdown item"
                              data-node-id="12771:5851"
                            >
                              <span className="flex items-center justify-center shrink-0 size-6">
                                <span className={`flex items-center justify-center rounded-[4px] size-5 border-2 ${selected ? 'bg-[#0267ff] border-[#0267ff]' : 'bg-white border-[#e5e7eb]'}`}>
                                  {selected && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  )}
                                </span>
                              </span>
                              <span className="flex-1 text-[12px] font-medium text-[#0a0a0a] leading-normal">{opt.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </section>
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Give your schedule a name:</p>
                <label className="text-[14px] font-normal text-[#4b535c]">Name schedule</label>
                <input type="text" placeholder="Placeholder" value={drawerForm.name} onChange={(ev) => setDrawerForm((f) => ({ ...f, name: ev.target.value }))} className="w-full h-10 px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] placeholder:text-[#4b535c]" />
                <p className="text-[12px] font-normal text-[#4b535c]">If not assigned, name will be given automatically</p>
              </section>
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Scheduling Dates <span className="font-normal text-[#4b535c]">Make a selection</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-normal text-[#4b535c]">Sending location</label>
                    <div className="relative">
                      <select value={drawerForm.sending} onChange={(ev) => setDrawerForm((f) => ({ ...f, sending: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="">Select</option>
                        <option value="Warehouse A">Warehouse A</option>
                        <option value="Warehouse B">Warehouse B</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-normal text-[#4b535c]">Receiving location</label>
                    <div className="relative">
                      <select value={drawerForm.receiving} onChange={(ev) => setDrawerForm((f) => ({ ...f, receiving: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="">Select</option>
                        <option value="Store A">Store A</option>
                        <option value="Store B">Store B</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                </div>
              </section>
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Schedule:</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-[14px] font-normal text-[#4b535c]">Repeats</label>
                    <div className="relative">
                      <select value={drawerForm.repeats} onChange={(ev) => setDrawerForm((f) => ({ ...f, repeats: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[100px]">
                    <label className="text-[14px] font-normal text-[#4b535c]">Time</label>
                    <div className="relative">
                      <select value={drawerForm.time} onChange={(ev) => setDrawerForm((f) => ({ ...f, time: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="">Select time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="text-[14px] font-normal text-[#4b535c]">Time zone</label>
                    <div className="relative">
                      <select value={drawerForm.timeZone} onChange={(ev) => setDrawerForm((f) => ({ ...f, timeZone: ev.target.value }))} className="w-full h-10 pl-3 pr-9 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] appearance-none">
                        <option value="pst">PST</option>
                        <option value="gmt+1">(GMT +1) Central Europe</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconChevronDownSelect /></span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-normal text-[#4b535c]">Day selection</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const selected = scheduleDrawerDays[day]
                      return (
                        <button key={day} type="button" onClick={() => toggleScheduleDay(day)} className={`h-9 px-3 rounded-[4px] border text-[14px] font-normal shrink-0 ${selected ? 'border-[#0267ff] bg-[#ebf3ff] text-[#0267ff]' : 'border-[#e9eaeb] bg-white text-[#4b535c] hover:bg-[#f3f4f6]'}`}>
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>
              <section className="flex flex-col gap-2">
                <label className="text-[14px] font-normal text-[#4b535c]">Ends on</label>
                <div className="relative">
                  <input type="text" placeholder="Select date" value={drawerForm.endsOn} onChange={(ev) => setDrawerForm((f) => ({ ...f, endsOn: ev.target.value }))} className="w-full h-10 pl-3 pr-10 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] placeholder:text-[#4b535c]" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b535c] pointer-events-none"><IconCalendarSidebar className="size-4" /></span>
                </div>
                <p className="text-[12px] font-normal text-[#4b535c]">If left empty, rebalancing will be repeating indefinitely</p>
              </section>
              <section className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#0a0a0a]">Notify users:</p>
                <input type="text" placeholder="Enter user emails" value={drawerForm.notify} onChange={(ev) => setDrawerForm((f) => ({ ...f, notify: ev.target.value }))} className="w-full h-10 px-3 rounded-[4px] border border-[#e9eaeb] bg-white text-[14px] text-[#0a0a0a] placeholder:text-[#4b535c]" />
              </section>
            </div>
            <footer className="flex items-center justify-end gap-3 shrink-0 p-6 border-t border-[#e9eaeb]">
              <button type="button" onClick={closeDrawer} className="h-10 px-4 rounded-[4px] text-[16px] font-medium text-[#0a0a0a] hover:bg-[#f3f4f6]">
                Cancel
              </button>
              <button type="button" className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium">
                {editingScheduleEntry ? 'Save changes' : 'Add Schedule'}
              </button>
            </footer>
          </div>
        </>
      )}
    </div>
  )
}

export default function App() {
  const [assignee, setAssignee] = useState({})
  const [optimiserOpen, setOptimiserOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [activeView, setActiveView] = useState('control-panel')

  return (
    <div className="h-screen bg-[#f9fafb] flex text-[#0a0a0a] overflow-hidden">
      {/* App shell: fixed sidebar – Figma 14404:7242 OptimiserSidebar/Expanded/Default */}
      <aside className={`min-w-[220px] w-max h-full shrink-0 bg-[#12171e] flex flex-col px-[var(--spacing-l,16px)] py-[var(--spacing-2xl,32px)] overflow-y-auto overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`} data-name="OptimiserSidebar/Expanded/Default" data-node-id="14404:7242">
        <div className="flex flex-col gap-[var(--spacing-2xl,32px)] min-w-0 flex-1 min-h-0" data-name="Container" data-node-id="14404:7243">
        <div className="flex flex-row items-center justify-between gap-2 w-full px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] shrink-0" data-name="Logo container" data-node-id="14404:7244">
          <AutoneLogo />
          <button type="button" className="flex items-center justify-center size-8 rounded-[var(--border-radius-s,4px)] text-white hover:bg-white/10 shrink-0" aria-label="Collapse sidebar" data-name="Icon=Collapse" data-node-id="12206:42115">
            <IconCollapse />
          </button>
        </div>

        <nav className={`flex-1 flex flex-col gap-[var(--spacing-xs,6px)] items-start w-full min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${optimiserOpen || insightsOpen ? 'overflow-visible' : 'overflow-y-auto'}`} data-name="Container" data-node-id="14404:7246">
          <button type="button" onClick={() => setActiveView('control-panel')} className={`h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-medium shrink-0 ${activeView === 'control-panel' ? 'bg-[#0267ff] text-white' : 'text-white hover:bg-white/5'}`} data-name="Sidebar element" data-node-id="14404:7247">
            <IconGrid className={`size-6 shrink-0 ${activeView === 'control-panel' ? 'text-white' : 'text-[#22272f]'}`} aria-hidden />
            <span>Overview</span>
          </button>
          <div className="flex flex-col gap-[var(--spacing-xs,6px)] w-full shrink-0">
            <button
              type="button"
              onClick={() => { setActiveView('insights'); setInsightsOpen((o) => !o); }}
              className={`h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] shrink-0 ${activeView === 'insights' ? 'bg-[#0267ff] text-white font-medium' : 'font-normal text-white hover:bg-white/5'}`}
              aria-expanded={insightsOpen}
              aria-haspopup="true"
              aria-expanded={insightsOpen}
              aria-haspopup="true"
              data-name="Sidebar element"
              data-node-id="14404:7252"
            >
              <IconBars className={`size-6 shrink-0 ${activeView === 'insights' ? 'text-white' : 'text-[#22272f]'}`} aria-hidden />
              <span className="flex-1 min-w-0 text-left">Insights</span>
              <span className={`ml-auto inline-flex size-5 shrink-0 transition-transform duration-200 ${activeView === 'insights' ? 'text-white' : 'text-white'} ${insightsOpen ? 'rotate-180' : ''}`} aria-hidden data-name="icon" data-node-id="I14404:7252;12203:35389">
                <IconInsightsChevron />
              </span>
            </button>
            {insightsOpen && (
              <div className="flex flex-col gap-[4px] pl-4 pb-2 w-full shrink-0">
                <button type="button" onClick={() => setActiveView('insights')} className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element">
                  Buying
                </button>
                <button type="button" onClick={() => setActiveView('insights')} className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element">
                  Data health
                </button>
                <button type="button" onClick={() => setActiveView('insights')} className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element">
                  Optimiser status
                </button>
                <button type="button" onClick={() => setActiveView('insights')} className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element">
                  <span className="flex-1 min-w-0 text-left">Forecast inspector</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded shrink-0">Premium</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-[var(--spacing-xs,6px)] w-full shrink-0">
            <button
              type="button"
              onClick={() => { setActiveView('optimiser'); setOptimiserSubView('schedule'); setOptimiserOpen((o) => !o); }}
              className={`h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] shrink-0 ${activeView === 'optimiser' ? 'bg-[#0267ff] text-white font-medium' : 'font-normal text-white hover:bg-white/5'}`}
              aria-expanded={optimiserOpen}
              aria-haspopup="true"
              data-name="Sidebar element"
              data-node-id="14404:7825"
            >
              <span className="relative shrink-0 size-6" data-name="Icon=new reorder" data-node-id="I14404:7825;12203:35386">
                <IconOptimiser className={`size-full ${activeView === 'optimiser' ? 'text-white' : 'text-[#22272f]'}`} aria-hidden />
              </span>
              <span className="flex flex-1 min-w-0 flex-col justify-center text-left text-[14px] leading-[100%]" data-node-id="I14404:7825;12203:35387">Optimiser</span>
              <span className={`relative shrink-0 size-5 inline-flex transition-transform duration-200 ${activeView === 'optimiser' ? 'text-white' : 'text-white'} ${optimiserOpen ? 'rotate-180' : ''}`} aria-hidden data-name="icon" data-node-id="I14404:7825;12203:35389">
                <IconInsightsChevron />
              </span>
            </button>
            {optimiserOpen && (
              <div className="flex flex-col gap-[4px] pl-4 pb-2 w-full shrink-0">
                <button type="button" className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7250">
                  Replenishment
                </button>
                <button type="button" className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7790">
                  Reorder
                </button>
                <button type="button" className="min-h-[36px] w-full flex items-center gap-[var(--spacing-s,8px)] px-[var(--spacing-s,8px)] py-[var(--spacing-xxs,4px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7793">
                  Rebalancing
                </button>
              </div>
            )}
          </div>
          <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7251">
            <IconBuy className="text-[#22272f] size-6 shrink-0" aria-hidden />
            <span>Buying</span>
          </button>
          <div className="h-px w-full bg-white/10 shrink-0 my-0" role="separator" data-name="divider" />
          {!optimiserOpen && !insightsOpen && (
            <>
              <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7254">
                <IconGridDots className="text-[#22272f] size-6 shrink-0" aria-hidden />
                <span>Assortment</span>
              </button>
              <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element" data-node-id="14404:7255">
                <IconCalendarSidebar className="text-[#22272f] size-6 shrink-0" aria-hidden />
                <span>Events</span>
              </button>
              <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element">
                <IconGears className="text-[#22272f] size-6 shrink-0" aria-hidden />
                <span>Parameters</span>
              </button>
              <button type="button" className="h-10 w-full flex items-center gap-[var(--spacing-m,12px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] rounded-[var(--border-radius-s,4px)] text-left text-[14px] font-normal text-white hover:bg-white/5 shrink-0" data-name="Sidebar element">
                <IconTeam className="text-[#22272f] size-6 shrink-0" aria-hidden />
                <span>Team</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar footer – Figma 145:935 */}
        <div className="flex flex-col gap-[var(--spacing-xs,6px)] items-start w-full shrink-0 mt-auto" data-name="Container" data-node-id="145:935">
          <button type="button" className="flex h-[40px] w-full shrink-0 items-center justify-center gap-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left text-[14px] font-normal text-white hover:bg-white/5" data-name="Sidebar element" data-node-id="145:936">
            <IconClockSidebar className="text-emerald-400 size-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 text-white">Data age</span>
            <span className="shrink-0 text-[14px] font-medium text-emerald-400">12h</span>
            <IconChevronRight className="text-[#22272f] size-5 shrink-0" aria-hidden />
          </button>
          <div className="h-px w-full shrink-0 bg-white/10" role="separator" data-name="divider" />
          <button type="button" className="flex h-[40px] w-full shrink-0 items-center justify-center gap-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left text-[14px] font-normal text-white hover:bg-white/5" data-name="Sidebar element" data-node-id="145:938">
            <IconChat className="text-[#22272f] size-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">Chat with us</span>
          </button>
          <button type="button" className="flex h-[40px] w-full shrink-0 items-center justify-center gap-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left text-[14px] font-normal text-white hover:bg-white/5" data-name="Sidebar element" data-node-id="145:939">
            <IconDollar className="text-[#22272f] size-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">Currency</span>
          </button>
          <button type="button" className="flex h-[40px] w-full shrink-0 items-center justify-center gap-[var(--spacing-m,12px)] rounded-[var(--border-radius-s,4px)] px-[var(--spacing-l,16px)] py-[var(--spacing-s,8px)] text-left text-[14px] font-normal text-white hover:bg-white/5" data-name="Sidebar element" data-node-id="145:940">
            <IconFlagUK className="size-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">English</span>
          </button>
          <button type="button" className="flex w-full shrink-0 items-center gap-[var(--spacing-s,8px)] rounded-[var(--border-radius-l,8px)] py-0 pl-0 pr-[var(--spacing-l,16px)] text-left shadow-[0px_8px_25px_0px_rgba(0,0,0,0.03)] hover:bg-white/5" data-name="user-avatar" data-node-id="145:941">
            <div className="relative size-[40px] shrink-0 overflow-hidden rounded-[var(--border-radius-l,8px)]" data-name="Avatar">
              <img src="/avatar-user.jpg" alt="" className="absolute inset-0 size-full object-cover pointer-events-none" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[2px] items-start text-left" data-node-id="I145:941;12206:42131">
              <p className="truncate w-full font-sans text-[16px] font-medium font-normal leading-normal tracking-[0] text-white" data-node-id="I145:941;12206:42132">Charles Morenno</p>
              <p className="truncate w-full font-sans text-[10px] font-normal leading-normal tracking-[0] text-[#878D94]" data-node-id="I145:941;12206:42133">charlesmorenno@gmail.com</p>
            </div>
            <IconChevronRight className="text-[#22272f] size-5 shrink-0" aria-hidden />
          </button>
        </div>
        </div>
      </aside>

      {/* App shell: fixed top bar + scrollable main */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 w-full overflow-hidden">
        <div className="shrink-0">
          <TopBar
            title={activeView === 'optimiser' && optimiserSubView === 'scope' ? 'Scope' : activeView === 'optimiser' ? 'Optimiser' : 'Overview'}
            subtitle={activeView === 'optimiser' && optimiserSubView === 'scope' ? null : activeView === 'optimiser' ? 'Automate replenishment, reordering, and rebalancing with scheduled inventory optimisation.' : "Overview area, your 'morning check-in' to prioritise and manage inventory, scheduling and more"}
            onBack={activeView === 'optimiser' && optimiserSubView === 'scope' ? () => setOptimiserSubView('schedule') : undefined}
          />
        </div>

        {/* Main: scrollable content panel */}
        <main className="flex-1 min-h-0 min-w-0 w-full pl-8 pr-8 pb-12 overflow-y-auto overflow-x-hidden">
        {activeView === 'optimiser' && optimiserSubView === 'scope' ? (
          <ScopePage />
        ) : activeView === 'optimiser' ? (
          <div className="pt-6">
            <OptimiserPage onAddJob={() => setOptimiserSubView('scope')} />
          </div>
        ) : activeView === 'insights' ? (
          <div className="pt-6">
            <InsightsPage />
          </div>
        ) : (
        <>
        {/* Page header – welcome/date; filters, search, actions */}
        <header className="w-[calc(100%+4rem)] min-w-0 -ml-8 bg-white border-b border-[#e5e7eb] pt-6 pb-4 px-8">
          <div className="flex flex-wrap items-center gap-3 w-full min-w-0">
            <div className="shrink-0 mr-2 min-w-0">
              <h1 className="text-xl font-semibold text-[#0a0a0a] leading-tight">Welcome back, Tamir</h1>
              <p className="text-sm text-[#6a7282]">Monday, February 23, 2026</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 ml-auto min-w-0 justify-end">
              <span className="text-sm text-[#4a5565] shrink-0">Filter views by</span>
              {['All products', 'All locations', 'All user types'].map((label) => (
                <button key={label} type="button" className="h-10 shrink-0 bg-[#f3f3f5] rounded-lg pl-3 pr-3 flex items-center justify-between gap-2 text-sm text-[#0a0a0a] min-w-[100px]">
                  <span className="truncate">{label}</span>
                  <IconChevronDown className="shrink-0" />
                </button>
              ))}
              <div className="flex items-center w-[280px] sm:w-[325px] shrink-0 h-[42px] rounded-[10px] border border-[#d1d5dc] bg-white overflow-hidden">
                <span className="pl-3 flex items-center justify-center text-[#4a5565] shrink-0" aria-hidden>
                  <IconSearch />
                </span>
                <input type="text" placeholder="Search insights..." className="flex-1 min-w-0 h-full pl-2 pr-4 bg-transparent border-0 text-base text-[#0a0a0a] placeholder:text-[#0a0a0a]/50 tracking-[-0.01em] outline-none" />
              </div>
              <NotificationButton />
              <div className="w-9 h-9 shrink-0 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-base font-medium">T</div>
            </div>
          </div>
        </header>

        <div className="pt-6 space-y-6">
          {/* Inventory schedule */}
          <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <IconCalendar className="text-[#4a5565]" />
                <div>
                  <h2 className="text-lg text-[#0a0a0a]">Inventory schedule</h2>
                  <p className="text-sm text-[#6a7282]">Time-critical inventory movements this week</p>
                </div>
              </div>
              <button type="button" className="shrink-0 h-10 px-4 rounded-lg bg-[#155dfc] text-white text-sm font-medium flex items-center gap-2">
                <IconPlus />
                Add schedule
              </button>
            </div>
            <div className="flex items-center gap-4 pb-3 mb-4 border-b border-[#e5e7eb] text-sm text-[#4a5565]">
              <span>Priority:</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ff6467]" /> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ff8904]" /> High</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#fdc700]" /> Medium</span>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {WEEK_DAYS.map((d) => (
                <div key={`${d.day}-${d.date}`} className={`rounded-lg border min-h-[200px] flex flex-col ${d.today ? 'bg-[#eff6ff] border-[#8ec5ff]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                  <div className="p-3 border-b border-[#d1d5dc]">
                    <p className={`text-xs ${d.today ? 'text-[#155dfc]' : 'text-[#6a7282]'}`}>{d.day}</p>
                    <p className={`text-lg font-normal ${d.today ? 'text-[#1447e6]' : 'text-[#101828]'}`}>{d.date}</p>
                    {d.today && <p className="text-xs text-[#155dfc]">Today</p>}
                  </div>
                  <div className="p-2 flex flex-col gap-2 flex-1">
                    {d.events.map((ev, i) => (
                      <EventCard key={i} {...ev} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Two columns: Alerts + Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Needs your attention */}
            <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg text-[#0a0a0a]">Needs your attention / What happened while you were away</h2>
                  <span className="text-xs bg-red-100 text-[#c10007] px-2 py-1 rounded-full">4 items</span>
                </div>
                <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">See all - inbox? <IconArrowRight /></button>
              </div>
              <div className="space-y-3">
                {ALERTS.map((alert, i) => (
                  <div key={i} className={`rounded-lg border-2 p-4 flex gap-3 ${alert.type === 'critical' ? 'bg-red-50 border-red-500' : 'border-[#e5e7eb]'}`}>
                    <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${alert.type === 'critical' ? 'bg-red-600 text-white' : alert.type === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}>
                      <IconWarning />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-[#0a0a0a]">{alert.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${alert.type === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'}`}>{alert.badge}</span>
                      </div>
                      <p className="text-sm text-[#4a5565] mt-1">{alert.body}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <select value={assignee[i] ?? 'Unassigned'} onChange={(e) => setAssignee((s) => ({ ...s, [i]: e.target.value }))} className="text-sm rounded-lg border border-[#e5e7eb] bg-[#f3f3f5] px-3 py-1.5">
                          <option>Unassigned</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* autone recommendations */}
            <section className="rounded-[14px] border border-[#bedbff] bg-gradient-to-br from-[#eff6ff] to-[#eef2ff] p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg text-[#0a0a0a]">autone recommendations</h2>
                  <span className="text-xs bg-[#155dfc] text-white px-2 py-1 rounded-full">AI-powered</span>
                </div>
                <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">See all <IconArrowRight /></button>
              </div>
              <div className="space-y-3">
                {RECOMMENDATIONS.map((rec, i) => (
                  <div key={i} className="bg-white border border-[#bedbff] rounded-lg p-4 flex gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-[#155dfc]">
                      {i === 0 && <IconTrendUp />}
                      {i === 1 && <IconLocation />}
                      {i === 2 && <IconTag />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-[#0a0a0a]">{rec.title}</h3>
                      <p className="text-sm text-[#4a5565] mt-1">{rec.body}</p>
                      <p className="text-sm text-[#1447e6] mt-1">{rec.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Surfacing autone value */}
          <section className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
              <div>
                <h2 className="text-lg text-[#0a0a0a]">Surfacing autone value</h2>
                <p className="text-sm text-[#6a7282]">Impact of using autone</p>
              </div>
              <button type="button" className="text-sm text-[#155dfc] flex items-center gap-1">See all <IconArrowRight /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VALUE_CARDS.map((card, i) => (
                <div key={i} className={`rounded-lg border border-[#e5e7eb] p-6 relative overflow-hidden ${card.bg}`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-[#0a0a0a] ${card.iconBg}`}>
                    <card.icon />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-normal tracking-tight text-[#0a0a0a]">{card.value}</span>
                    <span className="text-sm text-[#4a5565]">{card.unit}</span>
                  </div>
                  <h3 className="text-sm font-medium text-[#364153] mt-1">{card.title}</h3>
                  <p className="text-sm text-[#4a5565] mt-2">{card.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        </>
        )}
        </main>
      </div>
    </div>
  )
}
