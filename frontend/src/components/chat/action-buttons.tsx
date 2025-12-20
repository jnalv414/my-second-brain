/**
 * ActionButtons Component
 *
 * Message action buttons that appear on AI messages.
 * Buttons: copy, thumbs up, thumbs down, volume (speak), regenerate
 */

import { Copy, RefreshCw, ThumbsDown, ThumbsUp, Volume2 } from 'lucide-react'
import type { ActionButtonsProps } from './types'

export function ActionButtons({
  onCopy,
  onThumbsUp,
  onThumbsDown,
  onSpeak,
  onRegenerate,
}: ActionButtonsProps = {}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCopy}
        aria-label="copy"
        className="p-1.5 text-gray-500 hover:text-primary transition-colors"
      >
        <Copy className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onThumbsUp}
        aria-label="thumbs up"
        className="p-1.5 text-gray-500 hover:text-primary transition-colors"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onThumbsDown}
        aria-label="thumbs down"
        className="p-1.5 text-gray-500 hover:text-primary transition-colors"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onSpeak}
        aria-label="speak"
        className="p-1.5 text-gray-500 hover:text-primary transition-colors"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onRegenerate}
        aria-label="regenerate"
        className="p-1.5 text-gray-500 hover:text-primary transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  )
}
