import { afterEach, describe, expect, it } from 'vitest'
import {
  clearNativeChatDraftCacheForTests,
  appendNativeChatDraftCacheManual,
  readNativeChatDraftCache,
  readNativeChatDraftDocument,
  writeNativeChatDraftDocument,
  writeNativeChatDraftCache
} from './native-chat-draft-cache'
import { NATIVE_CHAT_COMPOSER_SCOPE_CACHE_MAX } from '../../../../shared/native-chat-scope-cache'

afterEach(() => {
  clearNativeChatDraftCacheForTests()
})

describe('native-chat draft cache', () => {
  it('returns an empty string for an unknown scope', () => {
    expect(readNativeChatDraftCache('pty-1')).toBe('')
  })

  it('round-trips a draft per scope key', () => {
    writeNativeChatDraftCache('pty-1', 'hello')
    writeNativeChatDraftCache('pty-2', 'world')
    expect(readNativeChatDraftCache('pty-1')).toBe('hello')
    expect(readNativeChatDraftCache('pty-2')).toBe('world')
  })

  it('drops the entry when the draft is cleared so stale text never resurfaces', () => {
    writeNativeChatDraftCache('pty-1', 'hello')
    writeNativeChatDraftCache('pty-1', '')
    expect(readNativeChatDraftCache('pty-1')).toBe('')
  })

  it('keeps every draft however many there are, since a draft that is pushed out is lost', () => {
    const total = NATIVE_CHAT_COMPOSER_SCOPE_CACHE_MAX + 40
    for (let i = 0; i < total; i += 1) {
      writeNativeChatDraftCache(`scope-${i}`, `draft-${i}`)
    }

    expect(readNativeChatDraftCache('scope-0')).toBe('draft-0')
    expect(readNativeChatDraftCache(`scope-${total - 1}`)).toBe(`draft-${total - 1}`)
  })

  it('keeps a structured draft when a block is appended by hand, so a picked skill survives', () => {
    writeNativeChatDraftDocument('pty-1', 'summarize this', {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'summarize this' }] }]
    })

    appendNativeChatDraftCacheManual('pty-1', '```js\ncode()\n```')

    expect(readNativeChatDraftCache('pty-1')).toBe('summarize this\n\n```js\ncode()\n```')
    expect(readNativeChatDraftDocument('pty-1', readNativeChatDraftCache('pty-1'))).toBeDefined()
  })
})
