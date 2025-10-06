'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { AdminTable } from '@/components/AdminTable';
import { ModalForm } from '@/components/ModalForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export interface AdminUser {
  id: string;
  username: string;
  role: 'SUPER_ADMIN' | 'USER';
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lockedUntil: string | null;
  failedLoginAttempts: number;
}

interface UsersAdminProps {
  initialUsers: AdminUser[];
}

const emptyUserForm = {
  username: '',
  role: 'USER' as 'SUPER_ADMIN' | 'USER',
  password: '',
  isActive: true
};

export function UsersAdmin({ initialUsers }: UsersAdminProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<AdminUser | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ ...emptyUserForm });

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filtered = useMemo(() => {
    return users.filter((user) => user.username.toLowerCase().includes(query.toLowerCase()));
  }, [users, query]);

  const openCreate = () => {
    setActiveUser(null);
    setForm({ ...emptyUserForm });
    setModalOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setActiveUser(user);
    setForm({
      username: user.username,
      role: user.role,
      password: '',
      isActive: user.isActive
    });
    setModalOpen(true);
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {
      username: (event.currentTarget.elements.namedItem('username') as HTMLInputElement).value,
      role: (event.currentTarget.elements.namedItem('role') as HTMLSelectElement).value,
      isActive: (event.currentTarget.elements.namedItem('isActive') as HTMLInputElement).checked
    };
    const passwordValue = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    if (!activeUser) {
      payload.password = passwordValue;
    } else if (passwordValue) {
      payload.password = passwordValue;
    }

    const response = await fetch(activeUser ? `/api/admin/users/${activeUser.id}` : '/api/admin/users', {
      method: activeUser ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      alert('Unable to save user.');
      return;
    }

    setModalOpen(false);
    router.refresh();
  };

  const resetPassword = async (user: AdminUser) => {
    const response = await fetch(`/api/admin/users/${user.id}/reset`, {
      method: 'POST',
      headers: {
        'x-csrf-token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
      }
    });
    if (!response.ok) {
      alert('Unable to reset password');
      return;
    }
    const data = await response.json();
    alert(`Temporary password for ${data.username}: ${data.temporaryPassword}`);
    router.refresh();
  };

  const toggleActive = async () => {
    if (!confirmDisable) return;
    const response = await fetch(`/api/admin/users/${confirmDisable.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
      },
      body: JSON.stringify({ isActive: !confirmDisable.isActive })
    });
    if (!response.ok) {
      alert('Unable to update user status');
      return;
    }
    setConfirmDisable(null);
    router.refresh();
  };

  const unlockUser = async (user: AdminUser) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
      },
      body: JSON.stringify({ clearLock: true })
    });
    if (!response.ok) {
      alert('Unable to unlock user');
      return;
    }
    router.refresh();
  };

  const renderLockStatus = (user: AdminUser) => {
    if (!user.lockedUntil) return 'No';
    const lockDate = new Date(user.lockedUntil);
    if (Number.isNaN(lockDate.getTime()) || lockDate.getTime() <= Date.now()) {
      return 'No';
    }
    return (
      <span
        className="text-xs font-semibold text-amber-600"
        title={`Locked until ${lockDate.toLocaleString()}`}
      >
        Locked
        <span className="ml-1 font-normal text-slate-500">
          {formatDistanceToNow(lockDate, { addSuffix: true })}
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search users"
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-primary-500 sm:w-72"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          onClick={openCreate}
          className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          Invite user
        </button>
      </div>
      <AdminTable
        columns={[
          { header: 'Username', accessor: (user) => user.username },
          { header: 'Role', accessor: (user) => (user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'User'), className: 'w-40' },
          { header: 'Active', accessor: (user) => (user.isActive ? 'Yes' : 'No'), className: 'w-24' },
          { header: 'Locked', accessor: (user) => renderLockStatus(user), className: 'w-52' },
          {
            header: 'Actions',
            className: 'w-72',
            accessor: (user) => (
              <div className="flex flex-wrap gap-2">
                <button className="text-xs font-semibold text-primary-600" onClick={() => openEdit(user)}>
                  Edit
                </button>
                <button className="text-xs font-semibold text-amber-600" onClick={() => resetPassword(user)}>
                  Reset password
                </button>
                <button className="text-xs font-semibold text-red-600" onClick={() => setConfirmDisable(user)}>
                  {user.isActive ? 'Disable' : 'Enable'}
                </button>
                {user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now() ? (
                  <button className="text-xs font-semibold text-emerald-600" onClick={() => unlockUser(user)}>
                    Unlock
                  </button>
                ) : null}
              </div>
            )
          }
        ]}
        data={filtered}
        emptyMessage="No users found. Invite your first team member."
      />

      <ModalForm title={activeUser ? 'Edit user' : 'Invite user'} isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <form className="space-y-4" onSubmit={submitForm}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              defaultValue={form.username}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue={form.role}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm"
            >
              <option value="USER">User</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              {activeUser ? 'New password (optional)' : 'Temporary password'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={12}
              required={!activeUser}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input id="isActive" name="isActive" type="checkbox" defaultChecked={form.isActive} className="h-4 w-4 rounded border-slate-300" />
            Active
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
              Save
            </button>
          </div>
        </form>
      </ModalForm>

      <ConfirmDialog
        title={confirmDisable?.isActive ? 'Disable user' : 'Enable user'}
        description={
          confirmDisable?.isActive
            ? 'The user will be prevented from signing in until re-enabled.'
            : 'The user will regain portal access.'
        }
        isOpen={!!confirmDisable}
        onCancel={() => setConfirmDisable(null)}
        onConfirm={toggleActive}
        confirmLabel={confirmDisable?.isActive ? 'Disable' : 'Enable'}
      />
    </div>
  );
}
