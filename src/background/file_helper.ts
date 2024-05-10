import { 
  unlinkSync, readdirSync, existsSync, mkdirSync, accessSync,
  constants as fsConstants, readFileSync
} from 'fs'

export class FileHelper {
  public get_static_path () {
    return Promise.resolve(__static)
  }

  public clear_folder (folder_path : string) {  
    if (existsSync(folder_path)) {
      const files = readdirSync(folder_path)
    
      for (const file of files) {
        const curPath = `${folder_path}/${file}`
        unlinkSync(curPath)
      }
    }
    return Promise.resolve()
  }
  
  public confirm_folder_exist (folder_path : string, do_create : boolean = false) {
    if (existsSync(folder_path)) {
      return Promise.resolve(true)
    }
  
    if (!do_create) {
      return Promise.resolve(false)
    }
  
    mkdirSync(folder_path)
    return Promise.resolve(true)  
  }
  
  /** check if a file is exist */
  public check_file_exist(file_path : string) {
    try {
      accessSync(file_path, fsConstants.F_OK)
      return Promise.resolve(true)
    } catch (err) {
      return Promise.resolve(false)
    }
  }
  
  public read_file (file_path : string) {
    return readFileSync(file_path)
  }
}
export const file_helper = new FileHelper()
