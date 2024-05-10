import { sqlite } from '../sqlite'

export default class {
  public async run () : Promise<void> {
    await sqlite.run(`
      create table if not exists Playlist(
        id          integer     not null    primary key     autoincrement,
        title       text,
        url         text
      );
    `)
    await sqlite.run(`
      create table if not exists Song(
        id            integer     not null    primary key     autoincrement,
        title         text,
        thumbnail_url text,
        url           text,
        latest_play   integer,
        playlist_id   integer
      );
    `)
    await sqlite.run(`
      CREATE INDEX IF NOT EXISTS song_id ON Song(id);
    `)
  }

  public async reset () : Promise<void> {
    const table_ls = ['Playlist', 'Song']
    for (const tableName of table_ls) {
      await sqlite.run(`delete from ${tableName};`)
    }
  }
}
