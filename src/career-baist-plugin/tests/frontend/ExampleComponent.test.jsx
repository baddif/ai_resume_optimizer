import React from 'react';
import { render, screen } from '@testing-library/react';

describe('ExampleComponent', () => {
  it('renders text', () => {
    render(<div>Hello React Test</div>);
    expect(screen.getByText('Hello React Test')).toBeInTheDocument();
  });
});
