import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@markers_Key'

export default function App() {

  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [isloading, setIsLoading] = useState(true)

  const [markers, setMarkers] = useState([
  ])

  useEffect(() => {
    (async() => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('location failed')
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accurary: Location.Accuracy.Lowest })
        console.log(location.coords)
        setLat(location.coords.latitude)
        setLng(location.coords.longitude)
        setIsLoading(false)
    })()
  }, [])

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(STORAGE_KEY,jsonValue)
    } catch (error) {
      console.log(error)
    }
  }

  const getData = async() => {
    try{
      return AsyncStorage.getItem(STORAGE_KEY)
      .then(response=> JSON.parse(response))
      .then(data => {
        if (data === null){
        data=[]
        }

        setMarkers(data)
      }) .catch (e => {
        console.log(e)
      })
    } catch(error) {
      console.log(error)
    }
  }

  if (isloading) {
    return <View style={styles.container}><Text>Loading Map</Text></View>
  }

  return (
    <View style={styles.container}>
    {/*  <Text>{lat.toFixed(3)},{lng.toFixed(3)}</Text> */}
      <MapView style={styles.map} 
      mapType='standard'
      initialRegion={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      onLongPress={(e) => {
        const newMarker = {"lat" : e.nativeEvent.coordinate.latitude, "lng": e.nativeEvent.coordinate.longitude}
        const updatedmarkers = [...markers, newMarker]
        setMarkers(updatedmarkers)
        storeData(updatedmarkers)
      }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{latitude: marker.lat, longitude: marker.lng}}
          />
        ))}
         <Marker
          key={1}
          title="Oma Paikka"
          coordinate={{latitude: lat, longitude: lng}}
        /> 
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - Constants.statusBarHeight,
  },
});
