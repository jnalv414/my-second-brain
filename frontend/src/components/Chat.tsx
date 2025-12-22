import { useCallback, useRef, useState } from "react";
import { ApiError, sendMessage } from "../api/client";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

export interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	isError?: boolean;
}

export function Chat() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "welcome",
			role: "assistant",
			content:
				"Hi! I'm Paddy, your AI assistant for managing your Obsidian vault. You can ask me to:\n\n- **Search notes**: \"Find notes about project ideas\"\n- **Create notes**: \"Create a note called Meeting Notes\"\n- **Explore connections**: \"What notes link to Daily Notes?\"\n\nHow can I help you today?",
			timestamp: new Date(),
		},
	]);
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const handleSend = useCallback(
		async (content: string) => {
			if (!content.trim() || isLoading) return;

			const userMessage: Message = {
				id: `user-${Date.now()}`,
				role: "user",
				content: content.trim(),
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);
			setIsLoading(true);
			scrollToBottom();

			try {
				const response = await sendMessage(content);

				const assistantMessage: Message = {
					id: `assistant-${Date.now()}`,
					role: "assistant",
					content: response.response,
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, assistantMessage]);
			} catch (error) {
				const errorMessage =
					error instanceof ApiError
						? error.message
						: "Failed to connect to the server. Please try again.";

				const errorResponse: Message = {
					id: `error-${Date.now()}`,
					role: "assistant",
					content: errorMessage,
					timestamp: new Date(),
					isError: true,
				};

				setMessages((prev) => [...prev, errorResponse]);
			} finally {
				setIsLoading(false);
				scrollToBottom();
			}
		},
		[isLoading, scrollToBottom],
	);

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Messages area */}
			<div className="flex-1 overflow-y-auto p-4">
				<div className="mx-auto max-w-3xl space-y-4">
					{messages.map((message) => (
						<MessageBubble key={message.id} message={message} />
					))}

					{isLoading && (
						<div className="flex items-center gap-2 text-[var(--text-secondary)]">
							<div className="flex gap-1">
								<span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" />
								<span
									className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]"
									style={{ animationDelay: "0.1s" }}
								/>
								<span
									className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]"
									style={{ animationDelay: "0.2s" }}
								/>
							</div>
							<span className="text-sm">Paddy is thinking...</span>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input area */}
			<ChatInput onSend={handleSend} disabled={isLoading} />
		</div>
	);
}
