// import { readdir } from 'node:fs/promises'
const fsPromises = require('node:fs/promises')
const readdir = fsPromises.readdir

const { promisify } = require('util')
const fs = require('fs')
const fsReadFile = promisify(fs.readFile)
const fsWriteFile = promisify(fs.writeFile)

async function readJsonFile (filename) {
  const content = await fsReadFile(filename, 'utf8')
  return JSON.parse(content)
}

async function writeJsonFile (filename, data) {
  await fsWriteFile(filename, JSON.stringify(data, null, 4))
}

async function writeTextFile (filename, text) {
  await fsWriteFile(filename, text)
}

async function getDirectoryListing (path) {
  const result = await readdir(path)
  return result
}

module.exports.readJsonFile = readJsonFile
module.exports.writeJsonFile = writeJsonFile
module.exports.writeTextFile = writeTextFile
module.exports.getDirectoryListing = getDirectoryListing
