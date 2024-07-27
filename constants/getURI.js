import * as FileSystem from 'expo-file-system'

export async function downLoadFile(connected, url) {
    const filename = getFilename(url);
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    if (fileInfo.exists) {
        return fileUri
    }
    else {
        if (!connected) {
            return null
        }
        else {
            const { uri } = await FileSystem.downloadAsync(url, fileUri)
            return  uri
        }
    }
}


function getFilename(url) {
    const uri = url.split('alt=media&token=').pop()
     return `mobileChat-${uri}`
}
   