// import React, { useState, useEffect } from 'react';
// import { View, Text, Image, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { Button } from 'react-native-paper';
// import { launchImageLibrary } from 'react-native-image-picker';
// import Voice from '@react-native-community/voice';
// import baseURL from './baseURL';

// const Question = ({ navigation }) => {
//   const [imageUri, setImageUri] = useState(null);
//   const [textInput, setTextInput] = useState('');
//   const [loading, setLoading] = useState(false); // Loading state for API call
//   const [response, setResponse] = useState('');
//   const [isRecording, setIsRecording] = useState(false); // State to manage voice recording

//   useEffect(() => {
//     // Initialize Voice event listeners
//     Voice.onSpeechStart = onSpeechStart;
//     Voice.onSpeechEnd = onSpeechEnd;
//     Voice.onSpeechResults = onSpeechResults;

//     // Cleanup listeners on component unmount
//     return () => {
//       Voice.destroy().then(Voice.removeAllListeners);
//     };
//   }, []);

//   // Voice event handlers
//   const onSpeechStart = () => {
//     setIsRecording(true);
//     console.log('Speech recognition started');
//   };

//   const onSpeechEnd = () => {
//     setIsRecording(false);
//     console.log('Speech recognition ended');
//   };

//   const onSpeechResults = (event) => {
//     const spokenText = event.value[0];
//     setTextInput(spokenText); // Set text input with transcribed voice text
//     console.log('Speech results:', spokenText);
//   };

//   const startVoiceRecognition = async () => {
//     try {
//       await Voice.start('en-US'); // Start voice recognition with English
//       setIsRecording(true);
//     } catch (error) {
//       console.error('Error starting voice recognition:', error);
//       Alert.alert('Error', 'Unable to start voice recognition');
//     }
//   };

//   const stopVoiceRecognition = async () => {
//     try {
//       await Voice.stop();
//       setIsRecording(false);
//     } catch (error) {
//       console.error('Error stopping voice recognition:', error);
//     }
//   };

//   // Function to handle image picking
//   const pickImage = () => {
//     launchImageLibrary(
//       { mediaType: 'photo' },
//       (response) => {
//         if (response.didCancel) {
//           console.log('User cancelled image picker');
//         } else if (response.errorCode) {
//           console.log('Image picker error: ', response.errorMessage);
//         } else if (response.assets && response.assets.length > 0) {
//           setImageUri(response.assets[0].uri);  // Store the image URI
//         }
//       }
//     );
//   };

//   // Handle text input change
//   const handleTextChange = (text) => {
//     setTextInput(text);
//   };

//   // Function to handle the API submission
//   const handleSubmit = async () => {
//     if (textInput.trim() === '' || !imageUri) {
//       Alert.alert('Validation Error', 'Please input a valid question and pick an image.');
//       return;
//     }

//     setLoading(true); // Start loading

//     // Create a new FormData object to send the image and text to the API
//     const formData = new FormData();
//     formData.append('sentence', textInput);  // Append text input (sentence)
//     formData.append('image', {
//       uri: imageUri,  // Image URI from the image picker
//       type: 'image/jpeg',  // Assuming the image is in JPEG format
//       name: 'image.jpg',  // Name of the file
//     });

//     try {
//       // Send a POST request to your API endpoint with the image and text
//       const response = await fetch(`${baseURL}/answer`, {
//         method: 'POST',
//         body: formData,  // FormData object containing both image and sentence
//       });

//       const result = await response.json();  // Parse the JSON response
//       console.log('API Response:', result);

//       // If the response is valid, navigate to ProcessingScreen with the response and imageUri
//       if (response.ok) {
//         setResponse(result.response);

//         // Navigate to the ProcessingScreen
//         navigation.navigate('Processing', { question: textInput, apiResponse: result.response, imageUri });
//       } else {
//         Alert.alert('Error', 'Failed to get a valid response from the API.');
//       }
//     } catch (error) {
//       console.error('API Error:', error);
//       Alert.alert('Error', 'Failed to get response from API.');
//     } finally {
//       setLoading(false); // Stop loading
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Green Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Ask a Question</Text>
//       </View>

//       {/* Image Picker */}
//       <Button
//         mode="contained"
//         style={styles.btnPickImage}
//         onPress={pickImage}
//       >
//         Pick an image
//       </Button>

//       {imageUri && (
//         <Image
//           source={{ uri: imageUri }}
//           style={styles.image}
//         />
//       )}

//       {/* Text Input */}
//       <TextInput
//         style={styles.input}
//         placeholder="Enter a valid question..."
//         placeholderTextColor="gray"
//         value={textInput}
//         onChangeText={handleTextChange}
//         color="black"
//       />

//       {/* Voice Input Button */}
//       <Button
//         mode="contained"
//         style={styles.btnVoice}
//         onPress={isRecording ? stopVoiceRecognition : startVoiceRecognition}
//       >
//         {isRecording ? 'Stop Recording' : 'Use Voice Input'}
//       </Button>

//       {/* Submit Button */}
//       <Button
//         mode="contained"
//         style={styles.btnSubmit}
//         onPress={handleSubmit}
//       >
//         Submit
//       </Button>

//       {/* Show loading indicator during the API call */}
//       {/* {loading && <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />} */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FDF4F4',
//     alignItems: 'center',
//   },
//   header: {
//     width: '100%',
//     height: 90,
//     backgroundColor: '#60d385',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 15,
//     marginBottom: 20,
//   },
//   headerText: {
//     color: 'white',
//     fontSize: 35,
//     marginLeft: 15,
//     fontWeight: 'bold',
//   },
//   input: {
//     backgroundColor: "#E5D6FF",
//     borderRadius: 25,
//     paddingHorizontal: 20,
//     fontSize: 18,
//     marginBottom: 30,
//     marginTop: 25,
//     height: 50,
//     color: "black",
//   },
//   image: {
//     width: 300,
//     height: 300,
//     marginTop: 30,
//     alignSelf: 'center',
//     borderRadius: 10,
//   },
//   btnPickImage: {
//     backgroundColor: "#60d385",
//     borderRadius: 25,
//     paddingVertical: 10,
//     paddingHorizontal: 60,
//     alignSelf: "center",
//     marginTop: 20,
//   },
//   btnVoice: {
//     backgroundColor: "#60d385",
//     borderRadius: 25,
//     paddingVertical: 10,
//     paddingHorizontal: 60,
//     alignSelf: "center",
//     marginTop: 10,
//   },
//   btnSubmit: {
//     backgroundColor: "#60d385",
//     borderRadius: 25,
//     paddingVertical: 10,
//     paddingHorizontal: 60,
//     alignSelf: "center",
//     marginTop: 20,
//   },
//   loadingIndicator: {
//     marginVertical: 20,
//   },
// });

// export default Question;







// import React, { useEffect } from 'react';
// import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';

// const Processing = ({ navigation, route }) => {
//   const { question, apiResponse, imageUri } = route.params;

//   useEffect(() => {
//     // Simulate processing for 3 seconds
//     const timer = setTimeout(() => {
//       // Navigate to AnswerScreen after 3 seconds
//       navigation.navigate('Answer', { response: apiResponse, imageUri });
//     }, 3000); // 3 seconds delay

//     return () => clearTimeout(timer); // Cleanup the timer on unmount
//   }, []);

//   return (
//     <View style={styles.container}>
//       {/* Green Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Processing</Text>
//       </View>

//       {/* Image Preview */}
//       {imageUri && (
//         <Image
//           source={{ uri: imageUri }}
//           style={styles.image}
//         />
//       )}

//       {/* Question Text */}
//       <Text style={styles.questionText}>{question}</Text>

//       {/* Activity Indicator */}
//       <ActivityIndicator style={styles.activityIndicator} size="large" color="#4CAF50" />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FDF4F4',  // White background
//     alignItems: 'center',
//   },
//   header: {
//     width: '100%',
//     height: 90,
//     backgroundColor: '#60d385',  // Green header color
//     justifyContent: 'center',
//     marginBottom: 20,
//     borderBottomLeftRadius: 15,  // Adding curves to the bottom left
//     borderBottomRightRadius: 15, // Adding curves to the bottom right
//   },
//   headerText: {
//     color: 'white',
//     marginLeft: 15,
//     fontSize: 40,
//     fontWeight: 'bold',
//       // Example font family
//   },
  
//   image: {
//     width: 300,
//     height: 300,
//     borderRadius: 10,
//     marginTop: 25,
//   },
//   questionText: {
//     fontSize: 20,
//     color: '#000',
//     fontWeight: 'bold',
//     marginTop: 25,
//     textAlign: 'center',
//   },
//   activityIndicator: {
//     marginTop: 40,
//   },
// });

// export default Processing;







// import React from 'react';
// import { SafeAreaView, Text, Image, StyleSheet, View } from 'react-native';

// const Answer = ({ route }) => {
//   const { response, imageUri } = route.params;  // Retrieve response and imageUri passed from Question screen

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Green Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Answer</Text>
//       </View>

//       {/* Display the image */}
//       {imageUri && (
//         <Image
//           source={{ uri: imageUri }}
//           style={styles.image}
//         />
//       )}

//       {/* Display the response */}
//       <Text style={styles.responseText}>{response}</Text>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FDF4F4',  // White background
//     alignItems: 'center',
//   },
//   header: {
//     width: '100%',
//     height: 90,
//     backgroundColor: '#60d385',  // Green header color
//     justifyContent: 'center',
//     borderBottomLeftRadius: 15,  // Adding curves to the bottom left
//     borderBottomRightRadius: 15,
//     marginBottom: 20,
//   },
//   headerText: {
//     color: 'white',
//     marginLeft: 15,
//     fontSize: 35,
//     fontWeight: 'bold',
//   },
//   responseText: {
//     fontSize: 20,
//     color: 'black',  // Set text color to black
//     marginTop: 30,
//     paddingHorizontal: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',  // Center the text
//   },
//   image: {
//     width: 300,
//     height: 300,
//     marginTop: 40,
//     borderRadius: 10,
//   },
// });

// export default Answer;









// import React from "react";
// import { StyleSheet } from "react-native";
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Question from "./Question";
// import Answer from "./Answer";
// import Processing from "./Processing";



// const Stack = createNativeStackNavigator()  

// export default function FYPNavigation(){

//     return(<NavigationContainer>

//         <Stack.Navigator initialRouteName="Question">

//         <Stack.Screen name="Question" component={Question} 
//              options={{
//                 headerShown: false, // Hide the default header
//               }}    
//         />

// <Stack.Screen name="Processing" component={Processing}
        
        
//         // options={{
//         //   headerShown: false
//         // }}
//         />


//         <Stack.Screen name="Answer" component={Answer}
        
        
//         // options={{
//         //   headerShown: false
//         // }}
//         />

      
       
//         </Stack.Navigator>

//     </NavigationContainer>)

// }

// const styles = StyleSheet.create({
//     header: {
//       height: 60,
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 10,
//       backgroundColor: 'white',
//       elevation: 4, // Adds a shadow on Android for header appearance
//     },
//     backButton: {
//       padding: 10,
//     },
//     backText: {
//       fontSize: 24,
//       color: 'black',
//     },
//     headerTitle: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       marginLeft: 10,
//     },
//     content: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//   });
