import { useSong } from '@/features/data'
import Player from '@/features/player'
import { getHandSettings, SongVisualizer } from '@/features/SongVisualization'
import { SongSource } from '@/types'
import { useEffect } from 'react'
import { getDefaultSongSettings } from '../SongVisualization/utils'

interface SongPreviewProps {
  songBytes?: ArrayBuffer
  songId: string
  source: SongSource
  className?: string,
}

function SongPreview({ songId, savePath, className }: SongPreviewProps) {
  const player = Player.player()
  const { data: song, error } = useSong(savePath)

  useEffect(() => {
    if (!song) {
      return
    }
    player.setSong(song, getDefaultSongSettings(song))
  }, [song, player])

  const songConfig = getDefaultSongSettings(song)
  return (
    <SongVisualizer
      song={song}
      config={songConfig}
      getTime={() => Player.player().getTime()}
      hand="both"
      handSettings={getHandSettings(songConfig)}
    />
  )
}

export type { SongPreviewProps }
export { SongPreview }
