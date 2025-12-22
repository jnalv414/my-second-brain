/**
 * API client for My Second Brain backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface ChatRequest {
	message: string;
}

export interface ChatResponse {
	response: string;
}

export interface HealthResponse {
	status: string;
}

export class ApiError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const errorText = await response.text();
		let message: string;
		try {
			const errorJson = JSON.parse(errorText);
			message = errorJson.detail || errorJson.message || errorText;
		} catch {
			message = errorText;
		}
		throw new ApiError(response.status, response.statusText, message);
	}
	return response.json();
}

/**
 * Send a chat message to Paddy agent.
 */
export async function sendMessage(message: string): Promise<ChatResponse> {
	const response = await fetch(`${API_BASE}/chat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message } satisfies ChatRequest),
	});
	return handleResponse<ChatResponse>(response);
}

/**
 * Check if the backend is healthy.
 */
export async function checkHealth(): Promise<HealthResponse> {
	const response = await fetch(`${API_BASE}/health`);
	return handleResponse<HealthResponse>(response);
}
