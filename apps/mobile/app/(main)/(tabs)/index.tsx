import { useRouter } from "expo-router";
import DashboardScreen from "../home/dashboard";

export default function HomeScreen() {
  const router = useRouter();

  const handleMapPress = () => {
    router.push('/home/map' as never);
  };

  return <DashboardScreen onMap={handleMapPress}/>;
}