import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [ok, setOk] = useState(true);
  const [weatherOfDays, setWeatherOfDays] = useState([]);

  const icons = {
    Clouds: "cloudy",
    Clear: "day-sunny",
    Atmosphere: "cloudy-gusts",
    Snow: "snow",
    Rain: "rains",
    Drizzle: "rain",
    Thunderstorm: "lightning",
  };

  // open weather API_KEY
  // 정상적인 방법이라면 API_KEY 를 서버에 저장하고 서버에 요청해 값을 받아와야 하지만
  // 연습이기 때문에 상수로 선언해서 사용한다.
  const API_KEY = "0971c5576c5d1196cf2dc8f606307748";

  const getWeather = async () => {
    // 위치 정보에 관한 유저 승인 여부 확인
    // const permission = await Location.requestForegroundPermissionsAsync();
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    // 유저 현위치의 위도 경도를 가져옴
    // 그 이유는 현 위치의 위도 경도 값을 가지고 Location.getCurrentPositionAsync 에 넣어서 현 위치의 정보를 얻기 위해서이다.
    // const position = Location.getCurrentPositionAsync({ accuracy: 5})
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    // 위도 경도 값을 가지고 현 위치의 정보를 얻을수 있다
    // 예시 : [{"city": "Pyeongtaek-si", "country": "South Korea", "district": "Godeok-dong", "isoCountryCode": "KR",
    // "name": "1894-4, Godeok-dong", "postalCode": "18008", "region": "Gyeonggi-do", "street": "Godeok-dong",
    // "streetNumber": "1894-4", "subregion": null, "timezone": "Asia/Seoul"}]
    const location = await Location.reverseGeocodeAsync(
      {
        latitude,
        longitude,
      },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);

    // open weather API 를 사용해 위도 경도에 맞는 날씨 정보를 가져오고 json 형식으로 담는다.
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    setWeatherOfDays(json.daily);
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="black" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={styles.weather}
      >
        {weatherOfDays.length === 0 ? (
          <View style={{ ...styles.load }}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : (
          weatherOfDays.map((day, index) => (
            <View key={index} style={styles.day}>
              <Text style={styles.date}>
                {new Date(day.dt * 1000).toString().substring(0, 10)}
              </Text>
              <View style={styles.temp}>
                <View>
                  <Text style={styles.tempTxt}>MIN</Text>
                  <Text style={styles.minTemp}>
                    {parseFloat(day.temp.min).toFixed(1)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.tempTxt}>MAX</Text>
                  <Text style={styles.maxTemp}>
                    {parseFloat(day.temp.max).toFixed(1)}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                }}
              >
                <Text style={styles.desc}>{day.weather[0].main}</Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={38}
                  color="white"
                />
              </View>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    color: "white",
    fontSize: 50,
    fontWeight: "500",
  },
  load: {
    width: SCREEN_WIDTH,
  },
  day: {
    alignItems: "center",
    width: SCREEN_WIDTH,
  },
  date: {
    color: "white",
    fontSize: 20,
  },
  temp: {
    marginTop: 30,
    flexDirection: "row",
    width: "85%",
    justifyContent: "space-between",
  },
  tempTxt: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  maxTemp: {
    color: "white",
    fontSize: 90,
  },
  minTemp: {
    color: "white",
    fontSize: 90,
  },
  desc: {
    color: "white",
    fontSize: 60,
    marginRight: 10,
  },
  tinyText: {
    color: "white",
    marginTop: 20,
    fontSize: 20,
  },
});
