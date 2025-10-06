interface LoginErrorProps {
  message: string | null;
}

export default function LoginError({ message }: LoginErrorProps) {
  if (!message) return null;
  return (
    <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}
