import * as React from 'react'
import { useState, useEffect } from 'react'
import { formatTime } from '@/utils'
import { SongPreviewModal } from '@/features/SongPreview'
import { AppBar, Modal, Sizer } from '@/components'
import { DifficultyLabel, SongMetadata } from '@/types'
import { useEventListener } from '@/hooks'
import { SearchBox } from './components/Table/SearchBox'
import { UploadForm, Table } from './components'
import { useSongManifest } from '@/features/data'
import { getUploadedLibrary } from '@/features/persist'

import { searchMidi, getAPi } from '@/api/midi'
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
  let [songs, setSongs] = useState([])
  const [search, setSearch] = useState('')
  const getMidi = async () => {
    const res1 = await getAPi();
    if (res1) {
      sessionStorage.setItem('ipPath', res1.data.ip);
      // setSearch('周杰伦');
      let res = await searchMidi(sessionStorage.getItem('ipPath'), { 'searchMidi': search });
      if (res.status === 200) {
        setSongs(res.data.seatchResList);
      }
    }
  }
  const [isUploadFormOpen, setUploadForm] = useState<boolean>(false)
  const [midiName, setmidiName] = useState<any>('')
  const selectedSongMeta = songs.find((s: any) => s.savePath === midiName)
  const uploadedLibrary = getUploadedLibrary()
  useEffect(() => {
    getMidi()
  }, [uploadedLibrary])

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
        show={midiName}
        songMeta={selectedSongMeta}
        onClose={() => {
          setmidiName(null)
        }}
      />
      <Modal show={isUploadFormOpen} onClose={handleCloseAddNew}>
        <UploadForm onClose={handleCloseAddNew} />
      </Modal>
      <div className="bg-purple-lightest w-full h-screen flex flex-col">
        {/* <AppBar /> */}
        <div className="p-6 mx-auto max-w-screen-lg flex flex-col flex-grow w-full">
    
          {/* <Sizer height={8} />
          <Sizer height={24} /> */}
          <div className="flex gap-4" >
          <span className="text-3xl">学习</span>
          {/* <span className="text-base"> 单击歌曲选择开始学习！</span> */}
            <SearchBox placeholder={'搜索歌曲名、歌手'} onSearch={setSearch} />
          </div>
          <Sizer height={32} />
          <Table
            columns={[
              { label: '歌曲名', id: 'midiName', keep: true },
              { label: '路径', id: 'savePath', keep: true },
            ]}
            getId={(s: SongMetadata) => s.savePath}
            rows={songs}
            filter={['midiName', 'savePath']}
            onSelectRow={setmidiName}
            search={search}
          />
        </div>
      </div>
    </>
  )
}
