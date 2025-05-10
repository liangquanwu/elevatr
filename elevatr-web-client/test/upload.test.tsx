import { render, screen } from '@testing-library/react';
import UploadPage from '@/app/(protected)/upload-page/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the firebase functions
jest.mock('@/app/utilities/firebase/functions', () => ({
  uploadVideo: jest.fn(),
}));

// Mock the Navbar component since it has complex dependencies
jest.mock('@/app/shared-components/navbar/navbar', () => {
  return function MockNavbar() {
    return <div data-testid="mock-navbar">Mock Navbar</div>;
  };
});

describe('UploadPage', () => {
  it('renders upload interface correctly', () => {
    render(<UploadPage />);
    
    // Check if the main elements are present
    expect(screen.getByText('Drag & drop your video file here')).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
  });
}); 