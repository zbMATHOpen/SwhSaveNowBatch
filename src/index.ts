import { Response } from 'node-fetch'
import csv = require('fast-csv')
import CsvParserStream from 'fast-csv/build/src/parser/CsvParserStream'

import fetch from 'node-fetch'

function parseCSV(res: Response): Promise<CsvParserStream> {
  return new Promise((resolve) => {
    const stream = res.body.pipe(csv.parse())
    stream
      .on('error', /* istanbul ignore next */ (error: Error) => console.error(error))
      .on('data', (row: string) => console.log(`ROW=${JSON.stringify(row)}`))
      .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`)
        resolve(stream)
      })
  })
}

export const greet = (name: string) => `Hello ${name}`

export const swh = () =>
  fetch('http://swmath.org/SWH/')
    .then(parseCSV)
    .then((stream: CsvParserStream) => stream.end())
