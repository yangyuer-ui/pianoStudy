import { SongMetadata } from '@/types'

const builtinManifest = require('./builtin-manifest.json')

const songs: SongMetadata[] = builtinManifest.map((s: any) => {
  return {
    file: `music/songs/${s.title}.mid`,
    title: s.title,
    artist: s.artist ?? s.arranger,
    difficulty: s.difficulty,
    source: 'builtin',
  }
})

const musicFiles: SongMetadata[] = songs

export { musicFiles }
