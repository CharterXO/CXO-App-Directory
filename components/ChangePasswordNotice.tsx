interface ChangePasswordNoticeProps {
  mustChange: boolean;
}

export default function ChangePasswordNotice({ mustChange }: ChangePasswordNoticeProps) {
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Update your password</h1>
      <p className="text-sm text-slate-600">
        {mustChange
          ? 'For security, you must set a new password before continuing.'
          : 'Update your password periodically to keep your account secure.'}
      </p>
    </div>
  );
}
