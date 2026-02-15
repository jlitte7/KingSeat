import React from "react";
import { View, Text, Modal, Pressable } from "react-native";

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttonText = "OK",
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <View className="p-6 pb-4">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              {message}
            </Text>
          </View>

          {/* Action */}
          <View className="border-t border-gray-200">
            <Pressable onPress={onClose} className="py-4 active:bg-gray-100">
              <Text className="text-center text-base font-semibold text-blue-600">
                {buttonText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
