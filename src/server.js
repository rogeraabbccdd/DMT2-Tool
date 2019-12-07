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

// DMT2 is released in 2010/06/16 :)
server.listen(616)

const validPath = async (rootpath) => {
  const exists = await fse.pathExists(rootpath + 'CLIENT.EXE')
  return exists
}

const readData = async (userpath) => {
  const songs = []
  const stage = []
  const discStreeam = fs.createReadStream(userpath + gameFilePath + gameFileDisc, 'utf16le')
    .pipe(csv.parse({ delimiter: '\t', headers: true, quote: '\'', escape: '\\', ignoreEmpty: true }))
    .on('data', (data) => {
      songs.push(data)
    })
  await once(discStreeam, 'end')

  for (let file in gameFileStages) {
    const stageStream = fs.createReadStream(userpath + gameFilePath + gameFileStages[file])
      .pipe(csv.parse({ delimiter: ',', quote: '`', escape: '\\', ignoreEmpty: true }))
      .on('data', (data) => {
        if (!isNaN(parseInt(data[0]))) stage.push(data)
      })

    await once(stageStream, 'end')
  }
  return { songs, stage }
}

const copyData = async (userpath, disc, stage) => {
  let exists = await fse.pathExists(userpath + gameFilePath + gameFileDisc)
  if (!exists || disc === true) {
    const filepath = path.join(__static, gameFileDisc)
    await fse.copy(filepath, userpath + gameFilePath + gameFileDisc, { overwrite: true })
  }
  for (let file in gameFileStages) {
    exists = await fse.pathExists(userpath + gameFilePath + gameFileStages[file])
    if (!exists || stage === true) {
      const filepath = path.join(__static, gameFileStages[file])
      await fse.copy(filepath, userpath + gameFilePath + gameFileStages[file], { overwrite: true })
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
    await once(readStream, 'end')

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

// init
server.post('/init', async (req, res) => {
  let success = false
  let msg = ''
  let songs = []
  let stage = []
  let datapath = req.body.path
  let valid = await validPath(datapath)
  if (valid === true) {
    await readData(datapath).then((data) => {
      success = true
      songs = data.songs
      stage = data.stage
    }).catch((err) => {
      msg = err
    })
  } else msg = `Can't find CLIENT.EXE in selected folder`
  res.json({ success, msg, songs, stage })
})

// validate settings, check folder exist
server.post('/saveSettings', async (req, res) => {
  let datapath = req.body.path
  let success = false
  let msg = ''

  let valid = await validPath(datapath)
  if (valid === true) {
    await copyData(datapath, false, false)
    success = true
  } else {
    msg = `Can't find CLIENT.EXE in selected folder`
  }
  res.json({ success, msg })
})

server.post('/saveSlot', async (req, res) => {
  let slot = req.body.slot
  let page = req.body.page
  let file = req.body.path + gameFilePath + req.body.mode + '_stage_' + req.body.num + '.csv'
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

server.post('/reset', async (req, res) => {
  let datapath = req.body.path
  let exist = await validPath(datapath)
  if (exist) {
    await copyData(datapath, false, true)
    res.json({ success: true, msg: '' })
  } else res.json({ success: false, msg: `Can't find CLIENT.EXE in selected folder` })
})
