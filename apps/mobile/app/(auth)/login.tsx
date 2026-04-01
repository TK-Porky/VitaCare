import { View, Text, TouchableOpacity } from "react-native";

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-primary mb-2">VitaCare</Text>
      <Text className="text-base text-gray-500 mb-10">
        Suivi médical & rendez-vous
      </Text>
      <TouchableOpacity className="w-full bg-primary py-4 rounded-xl items-center">
        <Text className="text-white font-semibold text-base">Se connecter</Text>
      </TouchableOpacity>
      <TouchableOpacity className="w-full border border-primary py-4 rounded-xl items-center mt-4">
        <Text className="text-primary font-semibold text-base">
          Créer un compte
        </Text>
      </TouchableOpacity>
    </View>
  );
}
