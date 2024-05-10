import { exec } from 'child_process'

const python_execute_path = `${__static}\\python\\dist\\main\\main.exe`

type PyFunc = {
  get_playlist: (url : string) => PlaylistInfo,
  get_song_info: (url : string) => SongInfo,
  download: (url : string, output_path : string, plugin_path : string) => { file_nm: string, format: string },
}

export function run_python<funcNm extends keyof PyFunc> (
  func_nm : funcNm, ...params : Parameters<PyFunc[funcNm]>
) : Promise<ReturnType<PyFunc[funcNm]>> {
  return new Promise(resolve => {
    let command = `${python_execute_path} ${func_nm}`
    for (const para of params) {
      command += ` ${para}`
    }
    
    console.log(command)
    const child = exec(command)

    child.stdout!.on('data', (json_data : string) => {
      const data = JSON.parse(json_data)
      resolve(data)
    })
  })
}
