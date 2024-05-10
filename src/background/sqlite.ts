import path from 'path'
import sqlite3 from 'sqlite3'
type Tstmt = string
type Tparams = Array<any>

export class Sqlite {
  private __get_db (file_path?: string) {
    if (file_path === undefined) {
      if (process.env.NODE_ENV === 'production') {
        file_path = path.resolve(__static, 'db.sqlite')
      }
      else {
        file_path = 'db.sqlite'
      }
    }
    return new sqlite3.Database(file_path)
  }

  // execute a query and return the results
  // TRow: the type of a row in the result
  public all<TRow> (stmt : Tstmt, params? : Tparams) : Promise<Array<TRow>> {
    return new Promise((resolve, reject) => {
      const db = this.__get_db()
      db.all<TRow>(stmt, params, (err, rows) => {
        db.close()
        if (err) {
          console.log(stmt)
          console.log(err)
          reject(err)
        }
        resolve(rows)
      })
    })
  }

  // only execute a statement, no result returned
  public run (stmt : Tstmt, params? : Tparams) : Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.__get_db()
      db.run(stmt, params, (err) => {
        db.close()
        if (err) {
          console.log(stmt)
          console.log(err)
          reject(err)
        }
        resolve()
      })
    })
  }
}

export const sqlite = new Sqlite()
