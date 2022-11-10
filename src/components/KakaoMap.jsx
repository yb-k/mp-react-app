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
