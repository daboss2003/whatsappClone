import React, {  useRef, useState } from 'react'
import { Audio } from 'expo-av'
import { uploadAudio } from '../constants/messageSender';


export function useAudioRecorder(connected, userID) {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [duration, SetDurtion] = useState(0)
  const intervalRef = useRef(null)

  async function startRecording() {
    try {
     if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecorder(recording);
      setIsRecording(true)
      SetDurtion(0)
      console.log('Recording started');
      intervalRef.current = setInterval(() => {
        SetDurtion((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording(messageID, token, username) {
    console.log('Stopping recording..');
    setIsRecording(false)
    await recorder.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    clearInterval(intervalRef.current);
    const uri = recorder.getURI();
    await uploadAudio(uri, messageID, connected, userID, token, username)
    console.log('Recording stopped and sent');
  }


  return {isRecording, stopRecording, startRecording, duration}
}

