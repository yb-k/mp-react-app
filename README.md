# Mp React App

Morpheus + React + Kakao Map 간단 샘플입니다.

## 설치

```bash
yarn install

yarn run start
```

## 사용 라이브러리

> Create-React-App

> [react-kakao-maps-sdk](https://react-kakao-maps-sdk.jaeseokim.dev/)

## 가이드

1. [kakao developer](https://developers.kakao.com/) 가입 / 앱 생성

2. 플랫폼 - Web - 사이트 도메인 등록

   `http://127.0.0.1:3000`

   `http://192.168.0.2:3000` <- 앱에서 실행한 도메인이 되어야한다.

3. JS 라이브러리 적용

   앱 키 - JavasScript 의 키를 복사하여 아래의 `APP_KEY`에 대체한다.

`public/index.html`

```html
<script
  type="text/javascript"
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=APP_KEY&libraries=services,clusterer,drawing"
></script>
```

> 만약 웹에서 401 에러가 발생되는 경우 앱키 또는 2번의 도메인이 다르기때문에 발생된다.

4. `react-kakao-maps-sdk` 설치

```bash
yarn add react-kakao-maps-sdk
```

5. 컴포넌트 작성

`src/components/KakaoMap.jsx`

```jsx
import { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

const KakaoMap = () => {
  const [center, setCenter] = useState({
    lat: 33.5563,
    lng: 126.79581,
  });

  return (
    <Map center={center} style={{ width: "100%", height: "360px" }}>
      <MapMarker position={center}>
        <div style={{ color: "#000" }}>im here!</div>
      </MapMarker>
    </Map>
  );
};

export default KakaoMap;
```

6. Morpheus API 모듈화

`src/native/index.js`

```js
// Eslint 사용시 globals에 "M"추가
const M = window.M;
export default M;
```

7. 좌표가져오는 API 작성

`src/native/location.js`

```js
import M from "./";

const coordsApadter = ({ latitude, longitude }) => {
  return {
    lat: Number(latitude),
    lng: Number(longitude),
  };
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    M.plugin("location").current({
      timeout: 10000,
      maximumAge: 1,
      callback: function ({ status, message, coords }) {
        if (status === "SUCCESS" && coords) {
          // 성공
          resolve(coordsApadter(coords));
        } else {
          // 실패
          reject(new Error("Getting GPS coords is failed"));
        }
      },
    });
  });
};
```

8. 컴포넌트 마운트 시점에 현재좌표를 가져오기

`src/components/KakaoMap.jsx`

```jsx
import { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { getCurrentLocation } from "../native/location";

const KakaoMap = () => {
  const [center, setCenter] = useState({
    lat: 33.5563,
    lng: 126.79581,
  });

  useEffect(() => {
    getCurrentLocation().then(({ lat, lng }) => {
      console.log(lng, lat);
      setCenter({
        lat,
        lng,
      });
    });
  }, []);
  return (
    <Map center={center} style={{ width: "100%", height: "360px" }}>
      <MapMarker position={center}>
        <div style={{ color: "#000" }}>im here!</div>
      </MapMarker>
    </Map>
  );
};

export default KakaoMap;
```

9. 런타임 환경에 따른 API 분기처리

`src/common/constants.js`

```js
export const APP_ENV = {
  APP: "app", // morpheus 앱으로 접속 시 경우
  BROWSER: "browser", // 크로스 플랫폼으로 일반 web도 지원하는 경우
};

// 모피어스 앱 내 개발환경
export const OS_ENV = {
  IOS: "ios", // ios
  ANDROID: "android", // android
  UNKOWN: "unknown",
};
```

`src/common/cofing.js`

```js
import { APP_ENV, OS_ENV } from "./constants";
const initRunTimeEnv = () => {
  let OS;
  const userAgent = window.navigator.userAgent;
  const TYPE = /morpheus/i.test(userAgent) ? APP_ENV.APP : APP_ENV.BROWSER;
  if (/android/i.test(userAgent)) {
    OS = OS_ENV.ANDROID;
  } else if (/ipad|iphone|ipod/i.test(userAgent) && !window.MSStream) {
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    OS = OS_ENV.IOS;
  } else {
    OS = OS_ENV.UNKOWN;
  }
  return {
    TYPE,
    OS,
  };
};

export const RUNTIME = initRunTimeEnv();
```

`src/native/location.js`

```js
import { RUNTIME } from "../common/config";
import { APP_ENV } from "../common/constants";
import M from "./";

const coordsApadter = ({ latitude, longitude }) => {
  return {
    lat: Number(latitude),
    lng: Number(longitude),
  };
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (RUNTIME.TYPE === APP_ENV.BROWSER) {
      console.warn("[getCurrentLocation] function is only for Morpheus App");
      resolve({}); // 넘어가기 또는 기본값 세팅
    } else {
      M.plugin("location").current({
        timeout: 10000,
        maximumAge: 1,
        callback: function ({ status, message, coords }) {
          if (status === "SUCCESS" && coords) {
            // 성공
            resolve(coordsApadter(coords));
          } else {
            // 실패
            reject(new Error("Getting GPS coords is failed"));
          }
        },
      });
    }
  });
};
```
