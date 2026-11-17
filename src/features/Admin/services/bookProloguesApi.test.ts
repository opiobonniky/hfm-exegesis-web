import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchBookPrologue, prologueToForm, upsertBookPrologue } from './bookProloguesApi';

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('@/services/api', () => ({ sendPostRequest: send }));
beforeEach(() => vi.clearAllMocks());

describe('prologue title round trip', () => {
  it('sends the typed title and restores it when editing', async () => {
    const form = prologueToForm({ bookName: 'John', title: 'The Gospel of John', summary: 'An overview' })!;
    send.mockResolvedValueOnce({ returnCode: 200 });
    expect(await upsertBookPrologue({ ...form, title: '  Life in His Name  ' })).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith('book-prologues', 'admin/upsert', expect.objectContaining({ bookName: 'John', title: 'Life in His Name' }));
    send.mockResolvedValueOnce({ returnCode: 200, returnData: { bookName: 'John', title: 'Life in His Name', summary: 'An overview' } });
    expect((await fetchBookPrologue('John'))?.title).toBe('Life in His Name');
    expect(send).toHaveBeenLastCalledWith('book-prologues', 'get', { bookName: 'John', lang: 'en' });
  });

  it('uses the book name for old prologues without a stored title', () => {
    expect(prologueToForm({ bookName: 'John' })?.title).toBe('John');
  });

  it('does not report success when the application response rejects the save', async () => {
    send.mockResolvedValue({ status: 200, returnCode: 400, returnMessage: 'Invalid title' });
    expect(await upsertBookPrologue(prologueToForm({ bookName: 'John' })!)).toEqual({ ok: false, message: 'Invalid title' });
  });
});
