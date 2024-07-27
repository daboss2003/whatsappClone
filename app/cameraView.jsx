import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {  Alert, StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, TouchableHighlight } from 'react-native';
import MyButton from '../components/MyButton'
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import Colors, { FontSize, brandColors } from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { AntDesign, Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { formatDuration } from '../constants/formatDate'
import * as ImagePicker from 'expo-image-picker'

const {width: deviceWidth} = Dimensions.get('window')

export default function Camera() {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const { message, status: isStatus, sender } = useLocalSearchParams()
    const [flash, setFlash] = useState(false)
    const [cameraMode, setCameraMode] = useState('picture')
    const cameraRef = useRef()
    const [availabeSize, setAvailableSize] = useState([]);
    const router = useRouter()
    const translateX = useSharedValue(0);
    const [duration, setDuration] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const intervalRef = useRef()
    const status = isStatus === 'true'

  const animatedStyle = useAnimatedStyle(() => ({
     transform: [{ translateX: translateX.value }]
  }), [cameraMode]);


  useEffect(() =>{
    NavigationBar.setBackgroundColorAsync(Colors.dark.background);
  }, []);

  useEffect(() => {
    if (cameraMode === 'picture') {
      translateX.value = withTiming( -15, { duration: 500, easing: Easing.out(Easing.ease) })
    }
    else {
      translateX.value = withTiming( 15, { duration: 500, easing: Easing.out(Easing.ease) })
    }
  }, [cameraMode]);

 

     async function recordViedo() {
       if (cameraRef.current) {
         try {
           setIsRecording(true)
           setDuration(0)
           intervalRef.current = setInterval(() => {
             setDuration((prev) => prev + 1)
           }, 1000);
           const video = await cameraRef.current.recordAsync();
           setIsRecording(false);
           clearInterval(intervalRef.current)
           router.navigate({ pathname: '/previewCaptured', params: { message, uri: video.uri, type: cameraMode, status, sender } });
          }
         catch (err) {
            Alert('Error', err)
          }
        }
  }
  
   async function stopRecord() {
        if (cameraRef.current  && isRecording) {
          cameraRef.current.stopRecording()
          setIsRecording(false)
        }
    }

     async function snap() {
       if (cameraRef.current) {
         try {
           const image = await cameraRef.current.takePictureAsync()
           router.navigate({ pathname: '/previewCaptured', params: { message, uri: image.uri,type: cameraMode, status, sender } });
          }
         catch (err) {
           Alert('Error', err)
          }
        }
    }

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.getAvailablePictureSizesAsync().then(sizes => setAvailableSize(sizes)).catch(err => Alert('Error', err))
    }
  },[]);

  async function selecteFromGallery() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions[cameraMode === 'picture' ? 'Images' : 'Videos'],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      router.navigate({ pathname: '/previewCaptured', params: { message, uri, type: cameraMode, sender } });
     }
  }
    
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  useEffect(() => {
    if (!status) return
    else {
      if (duration >= 30) {
        stopRecord()
      }
    }
  }, [duration]);

  
  if (!permission) {
    return <View />;
  }

  
   if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#fff' }}>We need your permission to show the camera</Text>
        <MyButton onPress={requestPermission} >grant permission</MyButton>
      </View>
    );
    }

  return (
    <View style={styles.container}>
      <StatusBar style='light' backgroundColor={Colors.dark.background} />
      <View style={styles.icons}>
        <AntDesign name="close" size={28} color="#fff" onPress={router.back} />
        {cameraMode === 'video' && <Text style={{ fontSize: FontSize.regular, color: '#fff' }}>{ formatDuration(duration)}</Text>}
        {
          flash  ?
            <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color="#fff" onPress={() => setFlash(false)}  />
            :
            <MaterialCommunityIcons name="lightbulb-outline" size={28} color="#fff" onPress={() => setFlash(true)} />
        }
      </View>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={'auto'}
        pictureSize={availabeSize[0]}
        enableTorch={flash}
        mode={cameraMode}
        ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <Feather name="image" size={24} color="#fff" onPress={selecteFromGallery} style={styles.controls} />
          <View>
              <TouchableHighlight onPress={cameraMode === 'picture' ? snap : recordViedo} style={styles.cameraCircle}>
               {
                isRecording
                ?
                <Entypo name="controller-stop" size={28} color="red" onPress={stopRecord} />
                :
                  <MaterialCommunityIcons name="camera-iris" size={28} color="#fff"  />
                }
                  
              </TouchableHighlight>
          </View>
          <MaterialCommunityIcons name="rotate-3d-variant" size={24} color="#fff" onPress={toggleCameraFacing} style={styles.controls} />
        </View>
      </CameraView>
      <View style={{flex: 1, maxHeight: 75, padding: 10}}>
        <Animated.View style={[{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', }, animatedStyle]}>
          <TouchableWithoutFeedback onPress={() => setCameraMode('video')}><Text  style={cameraMode === 'video' ? { ...styles.selected } : styles.unselected}>Video</Text></TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => setCameraMode('picture')}  ><Text style={cameraMode === 'picture' ? styles.selected : styles.unselected}>Photo</Text></TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: Colors.dark.background
  },
  camera: {
    flex: 2,
    justifyContent: 'flex-end'
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor:'transparent',
    width: deviceWidth,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  selected: {
    backgroundColor: brandColors.primary.dark,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: FontSize.regular,
    color: Colors.dark.text,
    paddingVertical: 7
  },
  unselected: {
    fontSize: FontSize.regular,
    color: Colors.dark.regularText
  },
  icons: {
    position: 'absolute',
    top: 30,
    width: deviceWidth,
    zIndex: 50,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controls: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'

  }
});