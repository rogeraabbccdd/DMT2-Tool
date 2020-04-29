/* global __static */

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import csv from 'fast-csv'
import fs from 'fs'
import fse from 'fs-extra'
import { once } from 'events'
import path from 'path'
import ini from 'ini'
import childProcess from 'child_process'

const exec = childProcess.execFile

const server = express()

server.use(bodyParser.urlencoded({
  extended: true
}))
server.use(bodyParser.json())
server.use(cors({
  origin: (origin, callback) => {
    callback(null, true)
  },
  methods: 'GET, POST',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

const gameDiscInfoFolder = 'Resource/DiscInfo/'
const gameFileDiscStock = 'discstock.csv'
const gameFileStages = {
  star1: 'star_stage_1.csv',
  star2: 'star_stage_2.csv',
  star3: 'star_stage_3.csv',
  pop1: 'pop_stage_1.csv',
  pop2: 'pop_stage_2.csv',
  pop3: 'pop_stage_3.csv',
  starb: 'star_stage_bonus.csv',
  popb: 'pop_stage_bonus.csv'
}
const gameFileClubs = [
  'blackwhite.csv',
  'challenger.csv',
  'conqueror.csv',
  'cottoncandy.csv',
  'customizer.csv',
  'djmaxidol.csv',
  'duo_stage_1.csv',
  'duo_stage_2.csv',
  'ELECTROBEAT.csv',
  'electroep.csv',
  'firststep.csv',
  'futurist.csv',
  'GOLDENDISC.csv',
  'heartbeat.csv',
  'MAXIMUM.csv',
  'nbrangernon.csv',
  'Preview.csv',
  'remixound.csv',
  'sonoflong.csv',
  'specialist.csv',
  'specialist2.csv',
  'SUPERSPEED.csv',
  'SWEETSOUND.csv',
  'thorlong.csv',
  'UNPLUGGED.csv',
  'ylong.csv'
]

const gamePakDiscInfoPak = 'Pack/DiscInfo.pak'
const gamePakDiscInfoPakBackup = 'Pack/DiscInfo_backup.pak'
const gameConfig = 'Resource/Config/setting.cfg'

let userPath = ''

// DMT2 is released in 2010/06/16 :)
server.listen(616)

const validPath = async (rootpath) => {
  const exists = await fse.pathExists(rootpath + 'CLIENT.EXE')
  return exists
}

const readData = async () => {
  const songs = []
  const stage = []
  const defaultSongs = []
  const defaultStage = []
  const settings = {}
  let exists = await fse.pathExists(userPath + gameDiscInfoFolder + gameFileDiscStock)
  if (exists === false) {
    await copyData(true, true)
  }

  let discStreeam = fs.createReadStream(userPath + gameDiscInfoFolder + gameFileDiscStock, 'utf16le')
    .pipe(csv.parse({ delimiter: '\t', headers: true, quote: '\'', escape: '\\', ignoreEmpty: true }))
    .on('data', (data) => {
      songs.push(data)
    })
  await once(discStreeam, 'finish')

  discStreeam = fs.createReadStream(path.join(__static, 'files/' + gameFileDiscStock), 'utf16le')
    .pipe(csv.parse({ delimiter: '\t', headers: true, quote: '\'', escape: '\\', ignoreEmpty: true }))
    .on('data', (data) => {
      defaultSongs.push(data)
    })
  await once(discStreeam, 'finish')

  for (let file in gameFileStages) {
    const stageStream = fs.createReadStream(userPath + gameDiscInfoFolder + gameFileStages[file])
      .pipe(csv.parse({ delimiter: ',', quote: '`', escape: '\\', ignoreEmpty: true }))
      .on('data', (data) => {
        if (!isNaN(parseInt(data[0]))) stage.push(data)
      })

    await once(stageStream, 'finish')
  }

  for (let file in gameFileStages) {
    const stageStream = fs.createReadStream(path.join(__static, 'files/' + gameFileStages[file]))
      .pipe(csv.parse({ delimiter: ',', quote: '`', escape: '\\', ignoreEmpty: true }))
      .on('data', (data) => {
        if (!isNaN(parseInt(data[0]))) defaultStage.push(data)
      })

    await once(stageStream, 'finish')
  }

  const config = ini.parse(fs.readFileSync(userPath + gameConfig, 'utf-8'))
  settings.dev_mode = config.setting.dev_mode
  settings.fullscreen = config.setting.fullscreen
  settings.show_cursor = config.setting.show_cursor
  settings.vsync = config.setting.vsync
  settings.sfx_volume = config.setting.sfx_volume
  settings.bgm_volume = config.setting.bgm_volume

  return { songs, stage, settings, defaultSongs, defaultStage }
}

const copyData = async (disc, stage) => {
  let exists = await fse.pathExists(userPath + gamePakDiscInfoPak)
  if (exists === true) {
    await fs.renameSync(userPath + gamePakDiscInfoPak, userPath + gamePakDiscInfoPakBackup)
  }
  for (let file of gameFileClubs) {
    exists = await fse.pathExists(userPath + gameDiscInfoFolder + file)
    if (exists === false) {
      const filepath = path.join(__static, 'files/' + file)
      await fse.copy(filepath, userPath + gameDiscInfoFolder + file, { overwrite: true })
    }
  }
  exists = await fse.pathExists(userPath + gameDiscInfoFolder + gameFileDiscStock)
  if (exists === false || disc === true) {
    const filepath = path.join(__static, 'files/' + gameFileDiscStock)
    await fse.copy(filepath, userPath + gameDiscInfoFolder + gameFileDiscStock, { overwrite: true })
  }
  for (let file in gameFileStages) {
    exists = await fse.pathExists(userPath + gameDiscInfoFolder + gameFileStages[file])
    if (exists === false || stage === true) {
      const filepath = path.join(__static, 'files/' + gameFileStages[file])
      await fse.copy(filepath, userPath + gameDiscInfoFolder + gameFileStages[file], { overwrite: true })
    }
  }

  // check official songs difficulty after reset stage
  if (!disc && stage) {
    const songs = []
    const discStreeam = fs.createReadStream(userPath + gameDiscInfoFolder + gameFileDiscStock, 'utf16le')
      .pipe(csv.parse({ delimiter: '\t', headers: true, quote: '\'', escape: '\\', ignoreEmpty: true }))
      .on('data', (data) => {
        songs.push(data)
      })
    await once(discStreeam, 'finish')

    const stagearr = []
    for (let file in gameFileStages) {
      const stageStream = fs.createReadStream(userPath + gameDiscInfoFolder + gameFileStages[file])
        .pipe(csv.parse({ delimiter: ',', quote: '`', escape: '\\', ignoreEmpty: true }))
        .on('data', (data) => {
          if (!isNaN(parseInt(data[0]))) stagearr.push(data)
        })

      await once(stageStream, 'finish', async () => {
        await fs.unlink(userPath + gameDiscInfoFolder + gameFileStages[file], (err) => {
          if (err) throw err
        })
      })
    }

    for (let s in stagearr) {
      const data = songs.filter(song => {
        return parseInt(song.no) === parseInt(stagearr[s][0])
      })[0]

      if (stagearr[s][0] === data.no.toString()) {
      // star mixing 9 * 3 * 3 = 81
        if (s < 81) {
          if (data.Star_1 > 0 || data.Star_2 > 0 || data.Star_3 > 0 || data.Star_4 > 0) {
            if (data.Star_1 === '0') {
              stagearr[s][2] = 0
              stagearr[s][3] = 0
              stagearr[s][4] = 0
            } else if (data.Star_1 > 0 && stagearr[s][3] === '0') {
              stagearr[s][2] = 2
              stagearr[s][3] = 1
              stagearr[s][4] = 0
            }
            if (data.Star_2 === '0') {
              stagearr[s][5] = 0
              stagearr[s][6] = 0
              stagearr[s][7] = 0
            } else if (data.Star_2 > 0 && stagearr[s][6] === '0') {
              stagearr[s][5] = 2
              stagearr[s][6] = 2
              stagearr[s][7] = 0
            }
            if (data.Star_3 === '0') {
              stagearr[s][8] = 0
              stagearr[s][9] = 0
              stagearr[s][10] = 0
            } else if (data.Star_3 > 0 && stagearr[s][9] === '0') {
              stagearr[s][8] = 2
              stagearr[s][9] = 3
              stagearr[s][10] = 0
            }
            if (data.Star_4 === '0') {
              stagearr[s][11] = 0
              stagearr[s][12] = 0
              stagearr[s][13] = 0
            } else if (data.Star_4 > 0 && stagearr[s][12] === '0') {
              stagearr[s][11] = 2
              stagearr[s][12] = 4
              stagearr[s][13] = 0
            }
          }
        } else {
          if (data.Pop_1 > 0 || data.Pop_2 > 0 || data.Pop_3 > 0 || data.Pop_4 > 0) {
            if (data.Pop_1 === '0') {
              stagearr[s][2] = 0
              stagearr[s][3] = 0
              stagearr[s][4] = 0
            } else if (data.Pop_1 > 0 && stagearr[s][3] === '0') {
              stagearr[s][2] = 2
              stagearr[s][3] = 1
              stagearr[s][4] = 0
            }
            if (data.Pop_2 === '0') {
              stagearr[s][5] = 0
              stagearr[s][6] = 0
              stagearr[s][7] = 0
            } else if (data.Pop_2 > 0 && stagearr[s][6] === '0') {
              stagearr[s][5] = 2
              stagearr[s][6] = 2
              stagearr[s][7] = 0
            }
            if (data.Pop_3 === '0') {
              stagearr[s][8] = 0
              stagearr[s][9] = 0
              stagearr[s][10] = 0
            } else if (data.Pop_3 > 0 && stagearr[s][9] === '0') {
              stagearr[s][8] = 2
              stagearr[s][9] = 3
              stagearr[s][10] = 0
            }
            if (data.Pop_4 === '0') {
              stagearr[s][11] = 0
              stagearr[s][12] = 0
              stagearr[s][13] = 0
            } else if (data.Pop_4 > 0 && stagearr[s][12] === '0') {
              stagearr[s][11] = 2
              stagearr[s][12] = 4
              stagearr[s][13] = 0
            }
          }
        }
      }
    }

    let count = 0
    for (let file in gameFileStages) {
      const writeStream = fs.createWriteStream(userPath + gameDiscInfoFolder + gameFileStages[file], { flag: 'w' })
      writeStream.write(`stage${gameFileStages[file].slice(-5, -4)},songname,SP,PT,Hid,SP,PT,Hid,SP,PT,Hid,SP,PT,Hid\r\n`)
      for await (let s of stagearr) {
        writeStream.write(s.join(',') + '\r\n')
        count++
        if (count % 27 === 0) {
          count = 0
          stagearr.splice(0, 27)
          break
        }
      }
      writeStream.end()
    }
  }
}

const updateSlot = async (file, slot, page) => {
  let msg = ''
  try {
    const exists = await fse.pathExists(file)
    if (exists === false) {
      const err = `Can't find stage file in game folder`
      throw err
    }
    let stage = []
    const readStream = fs.createReadStream(file)
      .pipe(csv.parse({ delimiter: ',', quote: '`', escape: '\\', ignoreEmpty: true }))
      .on('data', (data) => {
        stage.push(data)
      })
    await once(readStream, 'finish', async () => {
      await fs.unlink(userPath + gameDiscInfoFolder + gameFileStages[file], (err) => {
        if (err) throw err
      })
    })

    let index = (page - 1) * 9 + slot.slotNum + 1
    slot.NM.speed = (slot.NM.speed.value) ? slot.NM.speed.value : slot.NM.speed
    slot.HD.speed = (slot.HD.speed.value) ? slot.HD.speed.value : slot.HD.speed
    slot.MX.speed = (slot.MX.speed.value) ? slot.MX.speed.value : slot.MX.speed
    slot.EX.speed = (slot.EX.speed.value) ? slot.EX.speed.value : slot.EX.speed

    stage[index] = [
      slot.songId, slot.song.name,
      slot.NM.speed, 1, 0
    ]

    if (slot.HD.level > 0) {
      stage[index].push(slot.HD.speed)
      stage[index].push(2)
      stage[index].push(0)
    } else {
      stage[index].push(0)
      stage[index].push(0)
      stage[index].push(0)
    }

    if (slot.MX.level > 0) {
      stage[index].push(slot.MX.speed)
      stage[index].push(3)
      stage[index].push(0)
    } else {
      stage[index].push(0)
      stage[index].push(0)
      stage[index].push(0)
    }

    if (slot.EX.level > 0) {
      stage[index].push(slot.EX.speed)
      stage[index].push(4)
      stage[index].push(0)
    } else {
      stage[index].push(0)
      stage[index].push(0)
      stage[index].push(0)
    }

    const writeStream = fs.createWriteStream(file, { flag: 'w' })
    for await (let s of stage) {
      writeStream.write(s.join(',') + '\r\n')
    }
    writeStream.end()
  } catch (err) {
    msg = err.message
  }
  return msg
}

const customSong = async (data) => {
  let msg = ''
  try {
    let songs = []
    const exists = await fse.pathExists(userPath + gameDiscInfoFolder + gameFileDiscStock)
    if (exists === false) {
      const err = `Can't find songs list file in game folder`
      throw err
    }
    const discStreeam = fs.createReadStream(userPath + gameDiscInfoFolder + gameFileDiscStock, 'utf16le')
      .pipe(csv.parse({ delimiter: '\t', headers: false, quote: '\'', escape: '\\', ignoreEmpty: true }))
      .on('data', (data) => {
        songs.push(data)
      })

    await once(discStreeam, 'finish', async () => {
      await fs.unlink(userPath + gameDiscInfoFolder + gameFileDiscStock, (err) => {
        if (err) throw err
      })
    })

    data.loopBga = parseInt(data.loopBga) === 0 ? 'FALSE' : 'TRUE'
    if (data.mode === 'add') {
      let write = [
        data.songNo,
        data.name,
        data.FullName,
        data.Genre,
        data.Composer,
        0, 0, 0,
        data.loopBga,
        0, 0, 0, 0,
        data.Star_1,
        data.Star_2,
        data.Star_3,
        data.Star_4,
        data.Pop_1,
        data.Pop_2,
        data.Pop_3,
        data.Pop_4
      ]
      songs.push(write)
    } else {
      const idx = await songs.findIndex((s) => {
        return s[0] === data.songNo
      })
      songs[idx] = [
        data.songNo,
        data.name,
        data.FullName,
        data.Genre,
        data.Composer,
        0, 0, 0,
        data.loopBga,
        0, 0, 0, 0,
        data.Star_1,
        data.Star_2,
        data.Star_3,
        data.Star_4,
        data.Pop_1,
        data.Pop_2,
        data.Pop_3,
        data.Pop_4
      ]
    }

    const writeStream = fs.createWriteStream(userPath + gameDiscInfoFolder + gameFileDiscStock, { flag: 'w', encoding: 'utf16le' })
    for await (let s of songs) {
      let w = ''
      for (let ss of s) {
        w += ss + '\t'
      }
      writeStream.write(w + '\r\n')
    }
    writeStream.end()

    // check stages
    const defaultStage = []
    for (let file in gameFileStages) {
      const stageStream = fs.createReadStream(path.join(__static, 'files/' + gameFileStages[file]))
        .pipe(csv.parse({ delimiter: ',', quote: '`', escape: '\\', ignoreEmpty: true }))
        .on('data', (data) => {
          if (!isNaN(parseInt(data[0]))) defaultStage.push(data)
        })

      await once(stageStream, 'finish')
    }

    const stage = []
    for (let file in gameFileStages) {
      const stageStream = fs.createReadStream(userPath + gameDiscInfoFolder + gameFileStages[file])
        .pipe(csv.parse({ delimiter: ',', quote: '`', escape: '\\', ignoreEmpty: true }))
        .on('data', (data) => {
          if (!isNaN(parseInt(data[0]))) stage.push(data)
        })

      if (file === 'starb' || file === 'popb') continue

      await once(stageStream, 'finish', async () => {
        await fs.unlink(userPath + gameDiscInfoFolder + gameFileStages[file], (err) => {
          if (err) throw err
        })
      })
    }

    for (let s in stage) {
      if (stage[s][0] === data.songNo.toString()) {
        // star mixing 9 * 3 * 3 = 81
        if (s < 81) {
          if (data.Star_1 > 0 || data.Star_2 > 0 || data.Star_3 > 0 || data.Star_4 > 0) {
            if (data.Star_1 === '0') {
              stage[s][2] = 0
              stage[s][3] = 0
              stage[s][4] = 0
            } else if (data.Star_1 > 0 && stage[s][3] === '0') {
              stage[s][2] = 2
              stage[s][3] = 1
              stage[s][4] = 0
            }
            if (data.Star_2 === '0') {
              stage[s][5] = 0
              stage[s][6] = 0
              stage[s][7] = 0
            } else if (data.Star_2 > 0 && stage[s][6] === '0') {
              stage[s][5] = 2
              stage[s][6] = 2
              stage[s][7] = 0
            }
            if (data.Star_3 === '0') {
              stage[s][8] = 0
              stage[s][9] = 0
              stage[s][10] = 0
            } else if (data.Star_3 > 0 && stage[s][9] === '0') {
              stage[s][8] = 2
              stage[s][9] = 3
              stage[s][10] = 0
            }
            if (data.Star_4 === '0') {
              stage[s][11] = 0
              stage[s][12] = 0
              stage[s][13] = 0
            } else if (data.Star_4 > 0 && stage[s][12] === '0') {
              stage[s][11] = 2
              stage[s][12] = 4
              stage[s][13] = 0
            }
          } else {
            stage[s] = defaultStage[s]
          }
        } else {
          if (data.Pop_1 > 0 || data.Pop_2 > 0 || data.Pop_3 > 0 || data.Pop_4 > 0) {
            if (data.Pop_1 === '0') {
              stage[s][2] = 0
              stage[s][3] = 0
              stage[s][4] = 0
            } else if (data.Pop_1 > 0 && stage[s][3] === '0') {
              stage[s][2] = 2
              stage[s][3] = 1
              stage[s][4] = 0
            }
            if (data.Pop_2 === '0') {
              stage[s][5] = 0
              stage[s][6] = 0
              stage[s][7] = 0
            } else if (data.Pop_2 > 0 && stage[s][6] === '0') {
              stage[s][5] = 2
              stage[s][6] = 2
              stage[s][7] = 0
            }
            if (data.Pop_3 === '0') {
              stage[s][8] = 0
              stage[s][9] = 0
              stage[s][10] = 0
            } else if (data.Pop_3 > 0 && stage[s][9] === '0') {
              stage[s][8] = 2
              stage[s][9] = 3
              stage[s][10] = 0
            }
            if (data.Pop_4 === '0') {
              stage[s][11] = 0
              stage[s][12] = 0
              stage[s][13] = 0
            } else if (data.Pop_4 > 0 && stage[s][12] === '0') {
              stage[s][11] = 2
              stage[s][12] = 4
              stage[s][13] = 0
            }
          } else {
            stage[s] = defaultStage[s]
          }
        }
      }
    }

    let count = 0
    for (let file in gameFileStages) {
      if (file === 'starb' || file === 'popb') continue
      const writeStream = fs.createWriteStream(userPath + gameDiscInfoFolder + gameFileStages[file], { flag: 'w' })
      writeStream.write(`stage${gameFileStages[file].slice(-5, -4)},songname,SP,PT,Hid,SP,PT,Hid,SP,PT,Hid,SP,PT,Hid\r\n`)
      for await (let s of stage) {
        writeStream.write(s.join(',') + '\r\n')
        count++
        if (count % 27 === 0) {
          count = 0
          stage.splice(0, 27)
          break
        }
      }
      writeStream.end()
    }
  } catch (err) {
    msg = err.message
  }
  return msg
}

const saveGames = async (data) => {
  const config = ini.parse(fs.readFileSync(userPath + gameConfig, 'utf-8'))
  config.setting.dev_mode = data.dev_mode
  config.setting.fullscreen = data.fullscreen
  config.setting.show_cursor = data.show_cursor
  config.setting.vsync = data.vsync
  config.setting.sfx_volume = data.sfx_volume
  config.setting.bgm_volume = data.bgm_volume
  fs.writeFileSync(userPath + gameConfig, ini.stringify(config))
}

// init
server.post('/init', async (req, res) => {
  let success = false
  let msg = ''
  let songs = []
  let stage = []
  let defaultSongs = []
  let defaultStage = []
  let settings = {}
  let datapath = req.body.path
  const valid = await validPath(datapath)
  if (valid === true) {
    userPath = datapath
    await readData().then((data) => {
      success = true
      songs = data.songs
      stage = data.stage
      settings = data.settings
      defaultSongs = data.defaultSongs
      defaultStage = data.defaultStage
    }).catch((err) => {
      msg = err.message
    })
  } else {
    userPath = ''
    msg = `Can't find CLIENT.EXE in selected folder`
  }

  res.json({ success, msg, songs, stage, settings, defaultSongs, defaultStage })
})

// validate settings, check folder exist
server.post('/saveSettings', async (req, res) => {
  let datapath = req.body.path
  let success = false
  let msg = ''
  const valid = await validPath(datapath)
  if (valid === true) {
    userPath = datapath
    await copyData(false, false)
    success = true
  } else {
    userPath = ''
    msg = `Can't find CLIENT.EXE in selected folder`
  }
  res.json({ success, msg })
})

server.post('/saveSlot', async (req, res) => {
  let slot = req.body.slot
  let page = req.body.page
  let file = userPath + gameDiscInfoFolder + req.body.mode + '_stage_' + req.body.num + '.csv'
  let success = false
  let msg = ''
  await updateSlot(file, slot, page).then((res) => {
    if (res === '') {
      success = true
    } else {
      msg = res
    }
  }).catch((err) => {
    msg = err.message
  })
  res.json({ success, msg })
})

server.get('/resetStage', async (req, res) => {
  const exist = await validPath(userPath)
  if (exist) {
    await copyData(false, true)
    res.json({ success: true, msg: '' })
  } else {
    userPath = ''
    res.json({ success: false, msg: `Can't find CLIENT.EXE in selected folder` })
  }
})

server.get('/resetSongs', async (req, res) => {
  const exist = await validPath(userPath)
  if (exist) {
    await copyData(true, true)
    res.json({ success: true, msg: '' })
  } else {
    userPath = ''
    res.json({ success: false, msg: `Can't find CLIENT.EXE in selected folder` })
  }
})

server.post('/custom', async (req, res) => {
  let data = req.body
  let success = false
  let msg = ''
  await customSong(data).then((res) => {
    if (res === '') {
      success = true
    } else {
      msg = res
    }
  }).catch((err) => {
    msg = err.message
  })

  res.json({ success, msg })
})

server.get('/customImg', async (req, res) => {
  let file = userPath + '/Resource/eyecatch/song/' + req.query.name + '_0.jpg'
  const exists = await fse.pathExists(file)
  if (exists === true) res.sendFile(file)
  else res.sendFile(path.join(__static, 'eyecatch/placeholder.jpg'))
})

server.post('/saveGame', async (req, res) => {
  let data = req.body
  let success = false
  let msg = ''
  await saveGames(data).then(() => {
    success = true
  }).catch((err) => {
    msg = err.message
  })

  res.json({ success, msg })
})

server.get('/play', async (req, res) => {
  exec(userPath + 'Client.exe')
  res.send('')
})
