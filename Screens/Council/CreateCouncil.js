// import React, { useState } from 'react';
// import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
// import WavyBackground from '../../Background/WavyBackground';
// import { Button } from 'react-native-paper';
// import WavyBackground2 from '../../Background/WavyBackground2';

// export default function CreateCouncil({ route, navigation }) {
//   const { width } = useWindowDimensions(); // screen width
//   const { Id } = route.params;
//   const memberId = Id
//   const [name, setName]= useState('');
//   const [desc,  setDesc] = useState('');
//   const [loading, setLoading] = useState(false)

//   const generateJoinCode = (memberId) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let code = memberId.toString(); // Start with the councilId as part of the code
//     for (let i = 0; i < 6; i++) { // Adjust the number of random characters as needed
//       code += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return code;
//   };
  
//   let code = generateJoinCode(memberId);

//   async function CreateCouncil() {
//     if (!name || !desc) {
//         Alert.alert('Please add a Title and Description.');
//         return;
//     }
    
//     const post = {
//         Name: name,
//         Description: desc,
//     };
//     setLoading(true)
//     try {
//       await new Promise(resolve => setTimeout(resolve, 2000))
//         const response = await fetch(`${baseURL}Council/PostCouncils?memberId=${Id}`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(post),
//         });

//         const json = await response.json();
          
//         if (response.ok) {
//             console.log(JSON.stringify(json));
//             Alert.alert(`${name} added successfully!`, `Now you will be redirected to Home.`, 
//               [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen', { memberID: Id })}]);
//         } else {
//             Alert.alert('Failed to create post.'+response.status);
//             console.log('Failed to create post.'+response.status)
//         }
//     } catch (error) {
//         Alert.alert('An error occurred while creating the post.');
//     }
//     setLoading(false)
// }


//   return (
//     <SafeAreaView style={styles.container}>
//       <WavyBackground2 />
//       <View style={styles.contentContainer}>
//       <Text style={styles.header}>Create a Council</Text>
//         <View style={styles.logoContainer}>
//         <View style={styles.logo}>
//             <Image source={require('../../assets/group.png')} style={styles.image}></Image>
//           </View>
//         </View>
        
//         <TextInput style={styles.input} selectionColor={'#f5d8a0'} placeholder="Name " keyboardType="default" onChangeText={setName} placeholderTextColor="#000" />
//         <TextInput style={styles.description} 
//         placeholder="Description"  
//         multiline={true}
//         numberOfLines={5} 
//         selectionColor={'#f5d8a0'}
//         textAlignVertical="top" 
//         keyboardType="default"
//         onChangeText={setDesc} 
//         placeholderTextColor="#000" />
//        <TouchableOpacity style={styles.signInButton} onPress={CreateCouncil} disabled={loading}>
//       {loading ? (
//         <ActivityIndicator size="small" color="#000" />
//       ) : (
//         <Text style={styles.signInButtonText}>Create</Text>
//       )}
//     </TouchableOpacity>
//       </View>
//       <View style={styles.footerContainer}>
//
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF', // Set the background color to white
//   },
//   contentContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoContainer: {
//     marginBottom: 40,
//   },
//   header:{
//     color : 'black', 
//     marginBottom: 10, 
//     fontSize: 30,
//     bottom: 40,
//     fontWeight: '400'
//   },
//   image : {
//     height : 100,
//     width : 100
//   },
//   logo: {
//     width: 140,
//     height: 140,
//     borderRadius: 25,
//     backgroundColor: '#f5d8a0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   titleText: {
//     bottom : 70,
//     color: 'black',
//     margin: 10,
//     fontSize: 30,
//     textAlign: 'center',
//   },
//   memberIdText: {
//     color: 'black',
//     marginBottom: 20,
//     fontSize: 20,
//     textAlign: 'center',
//   },
//   input: {
//     width: '85%',
//     padding: 15,
//     borderRadius: 25,
//     backgroundColor: '#F8F9FA',
//     marginBottom: 10,
//     color: 'black',
//   },
//   description: {
//     width: '85%',
//     padding: 15,
//     borderRadius: 25,
//     backgroundColor: '#F8F9FA',
//     marginBottom: 10,
//     color: 'black',
//     height: 150,
//     paddingBottom : 20,
//     textAlignVertical: 'top',
//     },
//   signInButton: {
//     width: '85%',
//     padding: 15,
//     borderRadius: 25,
//     backgroundColor: '#f5d8a0',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   signInButtonText: {
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   footerContainer: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     alignItems: 'center',
//     zIndex: -1
//   },
//   footerImage: {
//     width: '100%',
//     resizeMode: 'stretch',
//   },
// });

import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground2 from '../../Background/WavyBackground2';
import { launchImageLibrary } from 'react-native-image-picker';
import baseURL from '../Api';

export default function CreateCouncil({ route, navigation }) {
  const { width } = useWindowDimensions(); // Screen width
  const { Id } = route.params;
  const memberId = Id;
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State to hold selected image

  const generateJoinCode = (memberId) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = memberId.toString(); // Start with the memberId as part of the code
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  let code = generateJoinCode(memberId);

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        Alert.alert('Image selection cancelled');
      } else if (response.errorCode) {
        Alert.alert('Image selection error:', response.errorMessage || 'Unknown error');
      } else {
        const uri = response.assets[0].uri; // Get the URI of the selected image
        setSelectedImage(uri);
      }
    });
  };

  async function CreateCouncil() {
    if (!name || !desc) {
      Alert.alert('Please add a Title and Description.');
      return;
    }
  
    // Create FormData to handle multipart/form-data
    const formData = new FormData();
  
    // Append form fields
    formData.append('Name', name);
    formData.append('Description', desc);
    formData.append('memberId', Id); // Append memberId as part of the form data
   console.log('foram data is',formData)
    // Append the image if selected
    if (selectedImage) {
      const uriParts = selectedImage.split('.');
      const fileType = uriParts[uriParts.length - 1]; // Get the file extension
  
      formData.append('file', {
        uri: selectedImage, // Image URI
        name: `council_image.${fileType}`, // A custom file name
        type: `image/${fileType}`, // Image MIME type
      });
    }
  
    setLoading(true);
  
    try {
      // Simulate a loading delay (optional)
      await new Promise((resolve) => setTimeout(resolve, 2000));
  
      // Make the API call
      const response = await fetch(`${baseURL}Council/PostCouncils`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data', // Specify the correct content type
        },
        body: formData, // Pass the FormData object as the body
      });
  
      const json = await response.json();
      console.log('return json is ',json)
  
      if (response.ok) {
        console.log(JSON.stringify(json));
        Alert.alert(`${name} added successfully!`, `Now you will be redirected to Home.`, [
          { text: 'OK', onPress: () => navigation.replace('HomeScreen', { memberID: Id }) },
        ]);
      } else {
        Alert.alert('Failed to create council. Status code: ' + response.status);
        console.log('Failed to create council. Status code: ' + response.status);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      Alert.alert('An error occurred while creating the council.');
    }
  
    setLoading(false);
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Create a Council</Text>
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={handleImagePicker} style={styles.logo}>
            <Image
              source={selectedImage ? { uri: selectedImage } : require('../../assets/group.png')} // Show selected image or default image
              style={styles.image}
            />
          </TouchableOpacity>
          <Text style={{color: 'black', textAlign: 'center'}}>Change Photo ↺</Text>
        </View>

        <TextInput
          style={styles.input}
          selectionColor={'#f5d8a0'}
          placeholder="Name "
          keyboardType="default"
          onChangeText={setName}
          placeholderTextColor="#000"
        />
        <TextInput
          style={styles.description}
          placeholder="Description"
          multiline={true}
          numberOfLines={5}
          selectionColor={'#f5d8a0'}
          textAlignVertical="top"
          keyboardType="default"
          onChangeText={setDesc}
          placeholderTextColor="#000"
        />
        <TouchableOpacity style={styles.signInButton} onPress={CreateCouncil} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.signInButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footerContainer}>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  header: {
    color: 'black',
    marginBottom: 10,
    fontSize: 30,
    bottom: 40,
    fontWeight: '400',
  },
  image: {
    height: 110,
    width: 110,
    borderRadius: 50,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
  },
  description: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
    height: 150,
    textAlignVertical: 'top',
  },
  signInButton: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: -1,
  },
  footerImage: {
    width: '100%',
    resizeMode: 'stretch',
  },
});
