import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

export default function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      // keep splash visible
      await SplashScreen.preventAutoHideAsync();

      // simulate app loading (API, storage, fonts, etc.)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // hide splash
      await SplashScreen.hideAsync();

      setReady(true);
    };

    prepare();
  }, []);

  if (!ready) return null;

  return <Redirect href="/(tabs)/home" />;
}
