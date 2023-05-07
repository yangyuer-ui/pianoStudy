import { parseMidi } from '@/features/parsers'
import { Song, SongMetadata, SongSource } from '@/types'
import { getUploadedSong } from '@/features/persist'
import * as library from './library'
import { useCallback, useMemo, useState } from 'react'
import { useFetch } from '@/hooks'
import { FetchState } from '@/hooks/useFetch'

function handleSong(response: Response): Promise<Song> {
  return response.arrayBuffer().then(parseMidi)
}

export function getKey(id: string, source: SongSource) {
  return `${source}/${id}`
}

function getSongUrl( savePath: string) {
  return  `http://${sessionStorage.getItem('ipPath')}${savePath}`
}

export function useSong( savePath: string): FetchState<Song> {
  const url =
  savePath? getSongUrl(savePath)
      : undefined
  const fetchState = useFetch(url, handleSong)

  return  fetchState
}

// TODO: replace with a signals-like library, so that setting from one component is reflected elsewhere.
type SongManifestHookReturn = [SongMetadata[], (metadata: SongMetadata[]) => void]
export function useSongManifest(): SongManifestHookReturn {
  const [songs, setSongs] = useState<SongMetadata[]>(library.getSongsMetadata())

  const add = useCallback((metadataList: SongMetadata[]): void => {
    // library.addMetadata(metadataList)
    setSongs(library.getSongsMetadata())
  }, [])

  return useMemo(() => [songs, add], [songs, add])
}

export function useSongMetadata(id: string, source: SongSource) {
  return useMemo(() => library.getSongMetadata(id, source), [id, source])
}
