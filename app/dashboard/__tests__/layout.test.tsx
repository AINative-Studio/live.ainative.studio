import { render, screen } from '@testing-library/react';
import DashboardLayout from '../layout';
jest.mock('@/components/navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
jest.mock('@/components/footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
describe('DashboardLayout', () => {
  it('should render children within the layout', () => {
    render(<DashboardLayout><div data-testid="test-content">Test Content</div></DashboardLayout>);
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
  it('should render Navbar and Footer components', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
  it('should have correct layout structure', () => {
    const { container } = render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('flex', 'flex-col', 'min-h-screen');
  });
});
