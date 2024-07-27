import { Text } from '../components/Themed'
import {  KeyboardAvoidingView, View as DefaultView, Text as DefaultText,  StyleSheet, useColorScheme, Keyboard, TextInput } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Formik } from 'formik';
import { Entypo } from '@expo/vector-icons';
import Colors, { FontSize, brandColors } from '../constants/Colors';
import MyButton from './MyButton'
import { MaterialIcons } from '@expo/vector-icons';
import  EmojiKeyboard  from 'rn-emoji-keyboard'


export default function Form({ onSubmitForm, schema, object, max, children, buttonText, button, greenType, style, home, emojiAware}) {
    const [inputBorderWidth, setInputBorderWidth] = useState(1)
    const theme = useColorScheme() ?? 'light'
    const [openEmoji, setOpenEmoji] = useState(false)
    const inputRef = useRef(null)
   
   useEffect(() => {
        if (openEmoji) {
          Keyboard.dismiss()
          if (emojiAware) {
             emojiAware(true)
          }
        }
        else {
          inputRef.current?.focus()
          if (emojiAware) {
             emojiAware(false)
          }
        }
    },[openEmoji])
    
  return (
       <Formik
          initialValues={{[object.field]: object.value}}
            onSubmit={values => onSubmitForm(values)}
            validationSchema={schema}
          > 
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <>
              <KeyboardAvoidingView style={style}>
                {home && <Text style={{marginBottom: 20, fontSize: FontSize.heading}}>{object.field === 'userName' ? 'Enter your name' : 'Add about'}</Text>}
                <DefaultView style={{ ...styles.inputContainer }}>
                  <DefaultView style={{ alignItems: 'center',borderColor: brandColors[greenType][theme],  borderBottomWidth: inputBorderWidth, gap: 6, flexBasis: '90%', flexDirection: 'row'}}>
                    <TextInput
                    onChangeText={handleChange(object.field)}
                    cursorColor={brandColors[greenType][theme]}
                    onBlur={() => {
                      handleBlur(object.field)
                      setInputBorderWidth(1)
                      }
                    }
                    value={values[object.field]}
                    style={{ ...styles.input, color: brandColors[theme] }}
                    placeholder={object.field}
                    keyboardType="default"
                    ref={inputRef}
                    onFocus={() => setInputBorderWidth(2)}
                    />
                    <Text type={'regular'}>{max - values[object.field].length}</Text>
                  </DefaultView>
                    { openEmoji ?<MaterialIcons name="keyboard" size={24} color={Colors[theme].regularText} onPress={() =>setOpenEmoji(false)} /> : <Entypo name="emoji-happy" size={24} color={Colors[theme].regularText} onPress={() => setOpenEmoji(true)} />}
                </DefaultView>
                  {errors[object.field] && touched[object.field] ? <DefaultText style={{ fontSize: FontSize.regular, color: 'red', marginVertical: 10, textAlign: 'center' }}>{errors[object.field]}</DefaultText> : ''}
                  {children}
              <DefaultView style={home ? {flexDirection: 'row', gap: 25, alignItems: 'center', marginTop: 15, justifyContent: 'flex-end'}: {}}>
                {button}
                <MyButton onPress={handleSubmit} text={home} >{ buttonText}</MyButton>
              </DefaultView>
            </KeyboardAvoidingView>
            <EmojiKeyboard
                open={openEmoji}
                onClose={() => setOpenEmoji(false)} 
                onEmojiSelected={(emoji) => setFieldValue(object.field, `${values[object.field]}${emoji.emoji}`)}
                enableSearchBar
                allowMultipleSelections
                theme={{
                backdrop: 'tranparent',
                knob: brandColors[greenType][theme],
                container: theme === 'light' ? "#fff" : '#282829',
                header: brandColors[theme],
                skinkTonesContainer: theme === 'light' ? "#eee" : '#252427',
                    category: {
                    icon: brandColors[greenType][theme],
                    iconActive: '#fff',
                    container: theme === 'light' ? "#fff" : '#282829',
                    containerActive: brandColors[greenType][theme],
                },
                search: {
                    text: brandColors[theme],
                    placeholder: Colors[theme].regularText,
                    icon: brandColors[theme],
                    background: theme === 'light' ? "#eee" : '#252427',
                }
              }}
                
          />  
            </>
            )}
          </Formik>
  )
}


const styles = StyleSheet.create({
    input: {
    flexBasis: '85%'
  },
  inputContainer: {
    gap: 15,
    width: '95%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center', 
  }


})
  