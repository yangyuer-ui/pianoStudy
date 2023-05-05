import * as React from 'react'
import { useState, useEffect } from 'react'
import { formatTime } from '@/utils'
import { SongPreviewModal } from '@/features/SongPreview'
import { AppBar, Modal, Sizer } from '@/components'
import { DifficultyLabel, SongMetadata } from '@/types'
import { useEventListener } from '@/hooks'
import { Plus } from '@/icons'
import { SearchBox } from './components/Table/SearchBox'
import clsx from 'clsx'
import { UploadForm, Table } from './components'
import Head from 'next/head'
import { useSongManifest } from '@/features/data'
import { getUploadedLibrary } from '@/features/persist'

function getDifficultyLabel(s: number): DifficultyLabel {
  if (!s) {
    return '-'
  }

  const difficultyMap: { [d: number]: DifficultyLabel } = {
    0: '-',
    10: 'Easiest',
    20: 'Easier',
    30: 'Easy',
    40: 'Medium',
    50: 'Hard',
    60: 'Hardest',
    65: 'Hardest',
  }
  return difficultyMap[s]
}

export default function SelectSongPage() {
  const [songs, addSongs] = useSongManifest()
  const [isUploadFormOpen, setUploadForm] = useState<boolean>(false)
  const [selectedSongId, setSelectedSongId] = useState<any>('')
  const selectedSongMeta = songs.find((s) => s.id === selectedSongId)
  const [search, setSearch] = useState('')

  const uploadedLibrary = getUploadedLibrary()
  useEffect(() => {
    addSongs(uploadedLibrary)
  }, [uploadedLibrary, addSongs])

  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (event.key === 'Escape') {
      setUploadForm(false)
    }
  })


  const handleCloseAddNew = () => {
    setUploadForm(false)
  }

  return (
    <>
      <SongPreviewModal
        show={!!selectedSongId}
        songMeta={selectedSongMeta}
        onClose={() => {
          setSelectedSongId(null)
        }}
      />
      <Modal show={isUploadFormOpen} onClose={handleCloseAddNew}>
        <UploadForm onClose={handleCloseAddNew} />
      </Modal>
      <div className="bg-purple-lightest w-full h-screen flex flex-col">
        <AppBar />
        <div className="p-6 mx-auto max-w-screen-lg flex flex-col flex-grow w-full">
          <h2 className="text-3xl">学习</h2>
          <Sizer height={8} />
          <h3 className="text-base"> 选择歌曲，选择设置，然后开始学习</h3>
          <Sizer height={24} />
          <div className="flex gap-4">
            <SearchBox placeholder={'搜索歌曲名'} onSearch={setSearch} />
          </div>
          <Sizer height={32} />
          <Table
            columns={[
              { label: '歌曲名', id: 'title', keep: true },
              { label: 'Artist', id: 'artist', keep: true },
              {
                label: 'Length',
                id: 'duration',
                format: (n) => formatTime(n),
              },
              { label: 'Source', id: 'source' },
            ]}
            getId={(s: SongMetadata) => s.id}
            rows={songs}
            filter={['title', 'artist']}
            onSelectRow={setSelectedSongId}
            search={search}
          />
        </div>
      </div>
    </>
  )
}
