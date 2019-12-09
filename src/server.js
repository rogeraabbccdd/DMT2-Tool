/* global __static */

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import csv from 'fast-csv'
import fs from 'fs'
import fse from 'fs-extra'
import { once } from 'events'
import path from 'path'

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

const gameFilePath = 'Resource/DiscInfo/'
const gameFileDisc = 'discstock.csv'
const gameFileStages = {
  star1: 'star_stage_1.csv',
  star2: 'star_stage_2.csv',
  star3: 'star_stage_3.csv',
  pop1: 'pop_stage_1.csv',
  pop2: 'pop_stage_2.csv',
  pop3: 'pop_stage_3.csv'
}

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
  let exists = await fse.pathExists(userPath + gameFilePath + gameFileDisc)
  if (exists === false) {
    await copyData(true, true)
  }
  const discStreeam = fs.createReadStream(userPath + gameFilePath + gameFileDisc, 'utf16le')
    .pipe(csv.parse({ delimiter: '\t', headers: true, quote: '\'', escape: '\\', ignoreEmpty: true }))
    .on('data', (data) => {
      songs.push(data)
    })
  await once(discStreeam, 'finish')

  for (let file in gameFileStages) {
    const stageStream = fs.createReadStream(userPath + gameFilePath + gameFileStages[file])
      .pipe(csv.parse({ delimiter: ',', quote: '`', escape: '\\', ignoreEmpty: true }))
      .on('data', (data) => {
        if (!isNaN(parseInt(data[0]))) stage.push(data)
      })

    await once(stageStream, 'finish')
  }
  return { songs, stage }
}

const copyData = async (disc, stage) => {
  let exists = await fse.pathExists(userPath + gameFilePath + gameFileDisc)
  if (exists === false || disc === true) {
    const filepath = path.join(__static, gameFileDisc)
    await fse.copy(filepath, userPath + gameFilePath + gameFileDisc, { overwrite: true })
  }
  for (let file in gameFileStages) {
    exists = await fse.pathExists(userPath + gameFilePath + gameFileStages[file])
    if (exists === false || stage === true) {
      const filepath = path.join(__static, gameFileStages[file])
      await fse.copy(filepath, userPath + gameFilePath + gameFileStages[file], { overwrite: true })
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
      await fs.unlink(userPath + gameFilePath + gameFileStages[file], (err) => {
        if (err) throw err
      })
    })

    let index = (page - 1) * 9 + slot.slotNum + 1
    stage[index] = [
      slot.songId, slot.song,
      slot.NM.speed.value, 1, 0
    ]

    if (slot.HD.level > 0) {
      stage[index].push(slot.HD.speed.value)
      stage[index].push(2)
      stage[index].push(0)
    } else {
      stage[index].push(0)
      stage[index].push(0)
      stage[index].push(0)
    }

    if (slot.MX.level > 0) {
      stage[index].push(slot.MX.speed.value)
      stage[index].push(3)
      stage[index].push(0)
    } else {
      stage[index].push(0)
      stage[index].push(0)
      stage[index].push(0)
    }

    stage[index].push(0)
    stage[index].push(0)
    stage[index].push(0)

    const writeStream = fs.createWriteStream(file, { flag: 'w' })
    for await (let s of stage) {
      writeStream.write(s.join(',') + '\n')
    }
    writeStream.end()
  } catch (err) {
    msg = err
  }
  console.log(msg)
  return msg
}

const customSong = async (data) => {
  let msg = ''
  try {
    let songs = []
    const exists = await fse.pathExists(userPath + gameFilePath + gameFileDisc)
    if (exists === false) {
      const err = `Can't find songs list file in game folder`
      throw err
    }
    const discStreeam = fs.createReadStream(userPath + gameFilePath + gameFileDisc, 'utf16le')
      .pipe(csv.parse({ delimiter: '\t', headers: false, quote: '\'', escape: '\\', ignoreEmpty: true }))
      .on('data', (data) => {
        songs.push(data)
      })

    await once(discStreeam, 'finish', async () => {
      await fs.unlink(userPath + gameFilePath + gameFileDisc, (err) => {
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
        data.Star_1, 0, 0, 0,
        data.Pop_1,
        data.Pop_2,
        data.Pop_3,
        0
      ]
      songs.push(write)
    } else {
      const idx = await songs.findIndex((s) => {
        return s[0] === data.songNo
      })
      console.log(idx)
      songs[idx] = [
        data.songNo,
        data.name,
        data.FullName,
        data.Genre,
        data.Composer,
        0, 0, 0,
        data.loopBga,
        0, 0, 0, 0,
        data.Star_1, 0, 0, 0,
        data.Pop_1,
        data.Pop_2,
        data.Pop_3,
        0
      ]
    }

    const writeStream = fs.createWriteStream(userPath + gameFilePath + gameFileDisc, { flag: 'w', encoding: 'utf16le' })
    for await (let s of songs) {
      let w = ''
      for (let ss of s) {
        w += ss + '\t'
      }
      writeStream.write(w + '\n')
    }
    writeStream.end()
  } catch (err) {
    msg = err
  }
  return msg
}

// init
server.post('/init', async (req, res) => {
  let success = false
  let msg = ''
  let songs = []
  let stage = []
  let datapath = req.body.path
  let valid = await validPath(datapath)
  if (valid === true) {
    userPath = datapath
    await readData().then((data) => {
      success = true
      songs = data.songs
      stage = data.stage
    }).catch((err) => {
      msg = err
    })
  } else {
    userPath = ''
    msg = `Can't find CLIENT.EXE in selected folder`
  }

  res.json({ success, msg, songs, stage })
})

// validate settings, check folder exist
server.post('/saveSettings', async (req, res) => {
  let datapath = req.body.path
  let success = false
  let msg = ''
  let valid = await validPath(datapath)
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
  let file = userPath + gameFilePath + req.body.mode + '_stage_' + req.body.num + '.csv'
  let success = false
  let msg = ''
  await updateSlot(file, slot, page).then((res) => {
    if (res === '') {
      success = true
    } else {
      msg = res
    }
  }).catch((err) => {
    msg = err
  })
  res.json({ success, msg })
})

server.get('/reset', async (req, res) => {
  let exist = await validPath(userPath)
  if (exist) {
    await copyData(false, true)
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
  console.log(data)
  await customSong(data).then((res) => {
    console.log(res)
    if (res === '') {
      success = true
    } else {
      msg = res
    }
  }).catch((err) => {
    console.log(err)
    msg = err
  })

  res.json({ success, msg })
})

server.get('/customImg', async (req, res) => {
  let file = userPath + '/Resource/eyecatch/song/' + req.query.name + '_0.jpg'
  const exists = await fse.pathExists(file)
  if (exists === true) res.sendFile(file)
  else res.sendStatus(404)
})
