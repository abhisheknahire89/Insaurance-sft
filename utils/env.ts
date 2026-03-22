// Config for accessing environment variables safely
export const getGeminiApiKey = (): string => {
  const apiKey =
    import.meta.env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : undefined);

  if (!apiKey) {
    console.warn('VITE_GEMINI_API_KEY is not defined in the environment variables.');
  }

  return apiKey || '';
};
