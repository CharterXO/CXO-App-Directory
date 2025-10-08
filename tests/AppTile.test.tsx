import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppTile } from '@/components/AppTile';

describe('<AppTile />', () => {
  it('renders initials fallback when icon missing', () => {
    render(<AppTile name="Finance Suite" description="Finance app" loginUrl="https://example.com" />);
    expect(screen.getByText('FS')).toBeInTheDocument();
  });

  it('opens login url in new tab when clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<AppTile name="Helpdesk" description="Support" loginUrl="https://support.example.com" />);
    await userEvent.click(screen.getByRole('button', { name: /open helpdesk login/i }));
    expect(openSpy).toHaveBeenCalledWith('https://support.example.com', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });
});
