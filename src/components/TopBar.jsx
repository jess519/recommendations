import { IconArrowLeft, IconEllipsisVertical, IconPlus } from './icons'

export default function TopBar({
  title = 'Team',
  subtitle = 'Manage permissions and invites throughout your team',
  primaryButtonLabel = '',
  primaryButtonHref = '#',
  onPrimaryClick,
  onBack,
  showMenuButton,
  headerActions,
  onCreateSchedule,
  onUseLatestRecommendations,
}) {
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
      <div className="flex flex-1 gap-2 items-center justify-end min-w-0 shrink-0">
        {headerActions}
        {onUseLatestRecommendations && (
          <button
            type="button"
            onClick={onUseLatestRecommendations}
            className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium flex items-center gap-2 shrink-0 hover:bg-[#0252cc]"
          >
            <IconPlus />
            Use latest recommendations
          </button>
        )}
        {onCreateSchedule && (
          <button
            type="button"
            onClick={onCreateSchedule}
            className="h-10 px-4 rounded-[4px] bg-[#0267ff] text-white text-[16px] font-medium flex items-center gap-2 shrink-0 hover:bg-[#0252cc]"
          >
            <IconPlus />
            Create schedule
          </button>
        )}
        {showMenuButton && (
          <button type="button" className="flex items-center justify-center size-10 rounded-[4px] text-white hover:bg-white/10 shrink-0" aria-label="More options">
            <IconEllipsisVertical className="size-5" />
          </button>
        )}
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
