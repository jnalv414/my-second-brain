import type { Message } from "./Chat";

interface MessageBubbleProps {
	message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
	const isUser = message.role === "user";

	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-[80%] rounded-2xl px-4 py-3 ${
					isUser
						? "bg-[var(--accent)] text-white"
						: message.isError
							? "border border-red-500/50 bg-red-500/10 text-red-400"
							: "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
				}`}
			>
				{!isUser && (
					<div className="mb-1 flex items-center gap-2">
						<span className="text-sm">🧠</span>
						<span className="text-xs font-medium text-[var(--text-secondary)]">
							Paddy
						</span>
					</div>
				)}

				<div className="markdown-content whitespace-pre-wrap text-sm">
					{formatMarkdown(message.content)}
				</div>

				<div
					className={`mt-2 text-xs ${isUser ? "text-white/70" : "text-[var(--text-secondary)]"}`}
				>
					{formatTime(message.timestamp)}
				</div>
			</div>
		</div>
	);
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMarkdown(content: string): React.ReactNode {
	// Simple markdown formatting - for production use a proper markdown library
	const lines = content.split("\n");

	return lines.map((line, i) => {
		// Bold
		let formatted = line.replace(
			/\*\*(.+?)\*\*/g,
			'<strong class="font-semibold">$1</strong>',
		);

		// Inline code
		formatted = formatted.replace(
			/`([^`]+)`/g,
			'<code class="rounded bg-[var(--bg-tertiary)] px-1 py-0.5 font-mono text-xs">$1</code>',
		);

		// Lists
		if (formatted.startsWith("- ")) {
			formatted = `<span class="ml-2">• ${formatted.slice(2)}</span>`;
		}

		return (
			<span key={i}>
				<span dangerouslySetInnerHTML={{ __html: formatted }} />
				{i < lines.length - 1 && <br />}
			</span>
		);
	});
}
