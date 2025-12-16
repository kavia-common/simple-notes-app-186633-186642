import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import * as client from '../api/client';
import App from '../App';

// Mock API client
jest.mock('../api/client');

function mockNotes(list = []) {
  client.listNotes.mockResolvedValueOnce(list);
}

describe('Notes App smoke test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders header and empty states; can create and select a note', async () => {
    mockNotes([]);

    client.createNote.mockResolvedValueOnce({
      id: '1',
      title: 'Untitled',
      content: '',
      updatedAt: new Date().toISOString(),
    });

    client.updateNote.mockResolvedValue({
      id: '1',
      title: 'Changed',
      content: 'Body',
      updatedAt: new Date().toISOString(),
    });

    client.deleteNote.mockResolvedValue();

    await act(async () => {
      render(<App />);
    });

    // Header visible
    expect(screen.getByText(/Notes/i)).toBeInTheDocument();

    // Empty sidebar message
    expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();

    // Create a new note
    const newBtn = screen.getByRole('button', { name: /new note/i });
    await act(async () => {
      fireEvent.click(newBtn);
    });

    // After optimistic create, editor hint or inputs appear
    const titleInput = await screen.findByLabelText(/note title/i);
    expect(titleInput).toBeInTheDocument();

    // Type to update the title triggers debounce save
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Changed' } });
    });

    // Sidebar should show "Changed" title eventually
    expect(await screen.findByText('Changed')).toBeInTheDocument();

    // Delete the note
    const delBtn = screen.getByRole('button', { name: /delete selected note/i });
    await act(async () => {
      fireEvent.click(delBtn);
    });
  });
});
