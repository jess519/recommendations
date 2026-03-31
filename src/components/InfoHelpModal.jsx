import { useEffect } from 'react'
import { IconClose } from './icons'

/**
 * DS Modal — NEW Autone Design System 2.0 (Figma 12261:195)
 */
export default function InfoHelpModal({
  open,
  onClose,
  modalHeading,
  heading,
  body,
  sections,
}) {
  const titleId = 'info-help-modal-title'

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className="absolute inset-0 bg-black/45" aria-label="Close dialog" onClick={onClose} />
      <div
        className="relative z-[1] flex w-full max-w-[600px] flex-col overflow-hidden rounded-[6px] bg-white shadow-[0px_8px_25px_0px_rgba(0,0,0,0.1)]"
        data-name="Modal"
        data-node-id="12261:195"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-4 border-b border-[#e9eaeb] p-4">
          <h2 id={titleId} className="min-h-8 flex-1 text-lg font-medium leading-normal text-[#0a0a0a]">
            {modalHeading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-[4px] text-[#0a0a0a] hover:bg-[#f3f4f6]"
            aria-label="Close"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-4 py-7">
          {heading ? <p className="text-lg font-medium leading-normal text-[#0a0a0a]">{heading}</p> : null}
          {body ? <p className="text-base leading-normal text-[#0a0a0a]">{body}</p> : null}
          {sections?.length
            ? sections.map((section) => (
                <div key={section.title} className="flex flex-col gap-2">
                  <p className="text-lg font-medium leading-normal text-[#0a0a0a]">{section.title}</p>
                  {section.subsections?.length ? (
                    <div className="flex flex-col gap-4">
                      {section.subsections.map((sub) => (
                        <div key={sub.title} className="flex flex-col gap-2">
                          <p className="text-base font-medium leading-normal text-[#0a0a0a]">{sub.title}</p>
                          <div className="flex flex-col gap-2 text-base leading-normal text-[#0a0a0a]">
                            {sub.paragraphs.map((para, i) => (
                              <p key={i}>{para}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {section.paragraphs?.length ? (
                    <div className="flex flex-col gap-2 text-base leading-normal text-[#0a0a0a]">
                      {section.paragraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            : null}
        </div>

        <div className="flex shrink-0 justify-end border-t border-[#e9eaeb] p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-[4px] border border-[#e9eaeb] bg-white px-4 text-base font-medium text-[#0a0a0a] hover:bg-[#fafafa]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
