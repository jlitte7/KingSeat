import React from "react";
import { View, Text, Modal, Pressable } from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmDestructive = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
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

          {/* Actions */}
          <View className="border-t border-gray-200">
            <View className="flex-row">
              <Pressable
                onPress={onCancel}
                className="flex-1 py-4 active:bg-gray-100"
              >
                <Text className="text-center text-base font-semibold text-gray-700">
                  {cancelText}
                </Text>
              </Pressable>
              <View className="w-px bg-gray-200" />
              <Pressable
                onPress={onConfirm}
                className="flex-1 py-4 active:bg-gray-100"
              >
                <Text
                  className={`text-center text-base font-semibold ${
                    confirmDestructive ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {confirmText}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
