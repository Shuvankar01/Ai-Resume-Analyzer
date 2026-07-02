export default function envCheck() {
  if (import.meta.env.DEV) {
    if (!import.meta.env.VITE_API_URL) {
      console.warn(
        '⚠️ [Environment Warning]: VITE_API_URL is not defined in your environment variables. ' +
        'Please check your frontend .env configuration.'
      );
    }
  }
}
