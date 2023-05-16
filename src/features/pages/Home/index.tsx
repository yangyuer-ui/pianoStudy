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
  let [netStatud, setnetStatud] = useState(true)
  const [isUploadFormOpen, setUploadForm] = useState<boolean>(false)
  const [midiName, setmidiName] = useState<any>('')
  const selectedSongMeta = songs.find((s: any) => s.savePath === midiName)
  const uploadedLibrary = getUploadedLibrary()
  useEffect(() => {
    getMidi();
    // 监听网络
    // 网络由异常到正常时触发
    window.addEventListener('online', function () {
      setnetStatud(true);
    })
    // 网络由正常到异常触发
    window.addEventListener('offline', function () {
      setnetStatud(false);
    })
  }, [search])

  const getMidi = async () => {
    const res1 = await getAPi();
    if (res1) {
      sessionStorage.setItem('ipPath', res1.data.ip);
      let res = await searchMidi(sessionStorage.getItem('ipPath'), { 'searchMidi': search });
      if (res.status === 200) {
        setSongs(res.data.seatchResList);
      }
    }
  }
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
      <div style={{display: netStatud?'none':'block'}}
        aria-label="Error message"
        className="p-6 text-red-900 bg-[#f8d7da] border-[#f5c6cb] m-auto max-w-sm"
      >
       请检查网络连接！
      </div>
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
            <SearchBox placeholder={'输入歌曲名、歌手'} onSearch={setSearch} />
          </div>
          <Sizer height={32} />
          <Table
            columns={[
              { label: '歌曲名', id: 'midiName', keep: true },
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
