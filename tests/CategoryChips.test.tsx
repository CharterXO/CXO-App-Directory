import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryChips } from '@/components/CategoryChips';

describe('<CategoryChips />', () => {
  it('toggles categories', async () => {
    const selected: string[] = ['Finance'];
    const onToggle = vi.fn();
    const onClear = vi.fn();
    render(
      <CategoryChips categories={['Finance', 'Sales']} selected={selected} onToggle={onToggle} onClear={onClear} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Finance' }));
    expect(onToggle).toHaveBeenCalledWith('Finance');
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
