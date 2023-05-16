import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

import { MidiStateEvent, SongSource } from '@/types'
import { SongVisualizer, getHandSettings, getSongSettings } from '@/features/SongVisualization'
import { SongScrubBar } from '@/features/controls'
import Player from '@/features/player'
import {
  useEventListener,
  useOnUnmount,
  usePlayerState,
  useSingleton,
  useSongSettings,
  useWakeLock,
} from '@/hooks'
import { useSong, useSongMetadata } from '@/features/data'
import { getSynthStub } from '@/features/synth'
import midiState from '@/features/midi'
import { TopBar, SettingsPanel } from './components'
import clsx from 'clsx'
import Head from 'next/head'
import { MidiModal } from './components/MidiModal'
// import { websocket } from 'websocket'

export function PlaySong() {
  const router = useRouter()
  const { id,savePath,recording }: { savePath: SongSource; id: string; recording?: string } =
    router.query as any
  const [settingsOpen, setSettingsPanel] = useState(false)
  const [isMidiModalOpen, setMidiModal] = useState(false)
  const [playerState, playerActions] = usePlayerState()
  const [isLooping, setIsLooping] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const player = Player.player()
  const synth = useSingleton(() => getSynthStub('acoustic_grand_piano'))
  let { data: song } = useSong(savePath)
  const [songConfig, setSongConfig] = useSongSettings(savePath)
  const [range, setRange] = useState<{ start: number; end: number } | undefined>(undefined)
  const isRecording = !!recording
  const songMeta = useSongMetadata(id, 'midishare')
  let [netStatud, setnetStatud] = useState(true)
  useWakeLock()

  const hand =
    songConfig.left && songConfig.right
      ? 'both'
      : songConfig.left
        ? 'left'
        : songConfig.right
          ? 'right'
          : 'none'

  // Hack for updating player when config changes.
  // Maybe move to the onChange? Or is this chill.
  const { waiting, left, right } = songConfig
  useEffect(() => {
    player.setWait(waiting)
    if (left && right) {
      player.setHand('both')
    } else {
      player.setHand(left ? 'left' : 'right')
    }
  }, [player, waiting, left, right])

  useOnUnmount(() => player.stop())

  useEffect(() => {

    if (!song) return
    // TODO: handle invalid song. Pipe up not-found midi for 400s etc.
    const config = getSongSettings(id, song)
    setSongConfig(config)
    player.setSong(song, config)
  }, [song, player, setSongConfig, playerActions, id])

  useEventListener<KeyboardEvent>('keydown', (evt: KeyboardEvent) => {
    if (evt.code === 'Space') {
      evt.preventDefault()
      playerActions.toggle()
    } else if (evt.code === 'Comma') {
      player.seek(player.currentSongTime - 16 / 1000)
    } else if (evt.code === 'Period') {
      player.seek(player.currentSongTime + 16 / 1000)
    }
  })

  useEffect(() => {
        // 监听网络
    // 网络由异常到正常时触发
    window.addEventListener('online', function () {
      setnetStatud(true);
    })
    // 网络由正常到异常触发
    window.addEventListener('offline', function () {
      setnetStatud(false);
    })
    var ws = new WebSocket("ws://localhost:5001/playWeb");
    //申请一个WebSocket对象，参数是服务端地址，同http协议使用http://开头一样，WebSocket协议的url使用ws://开头，另外安全的WebSocket协议使用wss://开头
    ws.onopen = function () {
      //当WebSocket创建成功时，触发onopen事件
      console.log("websocket连接成功");
      //ws.send("hello"); //将消息发送到服务端
    }

    ws.onclose = function (e) {
      //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
      console.log("websocket已断开");
    }
    ws.onerror = function (e) {
      //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
      console.log("websocket发生错误" +e);
    }
    type MidiEvent = {
      type: 'on' | 'off'
      velocity: number
      note: number
    }
    function parseMidiMessage(event:any): MidiEvent | null {
console.log('jieshou'+event.data);
      const data = event.data
      let status = data[0]
      let command = data.split(',')
      return {
        type: command[0]==='144' ? 'on' : 'off',
        note: command[1]*1,
        velocity: command[2]*1,
      }
    }
    
    ws.onmessage = function (e) {
      if (e.data) {
        const msg: MidiEvent|null=parseMidiMessage(e);
        if (!msg) {
          return
        }
        const { note, velocity } = msg
        if (msg.type === 'on' && msg.velocity > 0) {
          midiState.press(note, velocity)
        } else {
          midiState.release(note)
        }
      }
    }
    }, [player, synth, song, songConfig, soundOff])

  const handleSetRange = useCallback(
    (range?: { start: number; end: number }) => {
      player.setRange(range)
      setRange(range)
    },
    [setRange, player],
  )
  const handleLoopingToggle = (b: boolean) => {
    if (!b) {
      handleSetRange(undefined)
      setIsLooping(false)
      player.setRange()
      return
    } else {
      const duration = Player.player().getDuration()
      const tenth = duration / 10
      setIsLooping(true)
      handleSetRange({
        start: duration / 2 - tenth,
        end: duration / 2 + tenth,
      })
    }
  }

  return (
    <>
          <div style={{display: netStatud?'none':'block'}}
        aria-label="Error message"
        className="p-6 text-red-900 bg-[#f8d7da] border-[#f5c6cb] m-auto max-w-sm"
      >
       请检查网络连接！
      </div>
      <div
        className={clsx(
          // Enable fixed to remove all scrolling.
          'fixed',
          'flex flex-col h-screen max-h-screen max-w-screen',
        )}
      >
        {!isRecording && (
          <>
            <TopBar
              title={id}
              isLoading={!playerState.canPlay}
              isPlaying={playerState.playing}
              onTogglePlaying={playerActions.toggle}
              onClickRestart={playerActions.stop}
              onClickBack={() => {
                playerActions.stop()
                // router.push('/')
              }}
              onClickMidi={(e) => {
                e.stopPropagation()
                setMidiModal(!isMidiModalOpen)
              }}
              onClickSettings={(e) => {
                e.stopPropagation()
                setSettingsPanel(!settingsOpen)
              }}
              settingsOpen={settingsOpen}
            />
            <MidiModal isOpen={isMidiModalOpen} onClose={() => setMidiModal(false)} />
            <div className={clsx(!settingsOpen && 'hidden')}>
              <SettingsPanel
                onClose={() => setSettingsPanel(false)}
                onChange={setSongConfig}
                config={songConfig}
                song={song}
                onLoopToggled={handleLoopingToggle}
                isLooping={isLooping}
              />
            </div>
            <div className="relative min-w-full">
              <SongScrubBar rangeSelection={range} setRange={handleSetRange} height={40} />
            </div>
          </>
        )}
        <div
          className={clsx(
            'fixed w-screen h-[100vh] -z-10',
            '!h-[100dvh]',
            songConfig.visualization === 'sheet' ? 'bg-white' : 'bg-[#2e2e2e]',
          )}
        >
          <SongVisualizer
            song={song}
            config={songConfig}
            hand={hand}
            handSettings={getHandSettings(songConfig)}
            selectedRange={range}
            getTime={() => Player.player().getTime()}
            enableTouchscroll={songConfig.visualization === 'falling-notes'}
          />
        </div>
      </div>
    </>
  )
}
