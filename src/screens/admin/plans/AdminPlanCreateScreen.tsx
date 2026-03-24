import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  useColorScheme,
} from "react-native";
import { Alert } from "../../../utils/alert";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { plansApi } from "../../../api/plansApi";
import { Plan, PlanBenefit, PlanIconType } from "../../../types/plans";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { AdminHeader } from "../../../components/admin/layout/AdminHeader";
import { useThemeStore, useColors } from "../../../store/themeStore";

const ICONS: PlanIconType[] = ["star", "diamond", "rocket", "flash"];
const THEME_COLORS = [
  "#e0f2fe",
  "#3b82f6",
  "#1e293b",
  "#f3e8ff",
  "#9333ea",
  "#16a34a",
];

export const AdminPlanCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const editingPlan = route.params?.plan as Plan | undefined;

  const colorScheme = useColorScheme();
  const setTheme = useThemeStore((state) => state.setTheme);
  const colors = useColors();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme, setTheme]);

  const [name, setName] = useState(editingPlan?.name || "");
  const [price, setPrice] = useState(editingPlan?.price?.toString() || "");
  const [description, setDescription] = useState(
    editingPlan?.description || "",
  );
  const [isPopular, setIsPopular] = useState(editingPlan?.isPopular || false);
  const [themeColor, setThemeColor] = useState(
    editingPlan?.themeColor || "#e0f2fe",
  );

  const [benefits, setBenefits] = useState<PlanBenefit[]>(
    editingPlan?.benefits || [
      { id: "1", text: "Transferencias ilimitadas" },
      { id: "2", text: "Soporte prioritario 24/7" },
      { id: "3", text: "Tarjeta metálica exclusiva" },
    ],
  );

  const [tags, setTags] = useState<string[]>(editingPlan?.tags || []);
  const [newTag, setNewTag] = useState("");

  const [selectedIcon, setSelectedIcon] = useState<PlanIconType>(
    editingPlan?.icon || "star",
  );
  const [saving, setSaving] = useState(false);

  const handleAddBenefit = () => {
    const newBenefit: PlanBenefit = {
      id: Math.random().toString(36).substr(2, 9),
      text: "",
    };
    setBenefits([...benefits, newBenefit]);
  };

  const handleRemoveBenefit = (id: string) => {
    setBenefits(benefits.filter((b) => b.id !== id));
  };

  const handleUpdateBenefit = (id: string, text: string) => {
    setBenefits(benefits.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert("Error", "Por favor completa los campos obligatorios");
      return;
    }

    setSaving(true);
    try {
      const planData = {
        name,
        price: parseFloat(price),
        description,
        benefits: benefits.filter((b) => b.text.trim() !== ""),
        tags,
        icon: selectedIcon,
        isActive: true,
        isPopular,
        themeColor,
      };

      if (editingPlan) {
        await plansApi.updatePlan(editingPlan.id, planData);
      } else {
        await plansApi.createPlan(planData);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving plan:", error);
      Alert.alert("Error", "No se pudo guardar el plan");
    } finally {
      setSaving(false);
    }
  };

  // Dynamic Styles
  const containerBg = colors.background;
  const textColor = colors.text.primary;
  const cardBg = isDark ? "#1e293b" : "#fff";
  const borderColor = isDark ? "#334155" : "#e5e7eb";
  const inputBg = isDark ? "#1e293b" : "#fff";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: containerBg }}
      edges={["top", "bottom"]}
    >
      <AdminHeader
        title={editingPlan ? "Editar Plan" : "Crear Plan"}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: containerBg },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Información General
        </Text>

        <Input
          label="Nombre del Plan"
          placeholder="Ej. Plan Premium Mensual"
          value={name}
          onChangeText={setName}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Precio Mensual"
          placeholder="0.00"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Descripción Corta"
          placeholder="Breve resumen de lo que incluye..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          containerStyle={styles.inputContainer}
          style={{ height: 80, textAlignVertical: "top" }}
        />

        <View
          style={[styles.switchRow, { backgroundColor: cardBg, borderColor }]}
        >
          <Text style={[styles.switchLabel, { color: textColor }]}>
            Marcar como "Más Popular"
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#3b82f6" }}
            thumbColor={isPopular ? "#fff" : "#f4f3f4"}
            onValueChange={setIsPopular}
            value={isPopular}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Color del Tema
        </Text>
        <View style={styles.colorRow}>
          {THEME_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                themeColor === color && styles.colorOptionSelected,
                themeColor === color && { borderColor: textColor },
              ]}
              onPress={() => setThemeColor(color)}
            />
          ))}
        </View>

        <View style={styles.benefitsHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Etiquetas (Pills)
          </Text>
        </View>
        <View style={styles.tagsInputRow}>
          <TextInput
            style={[
              styles.tagInput,
              { backgroundColor: inputBg, color: textColor, borderColor },
            ]}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Ej. 1 Cuenta"
            placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tagPill,
                isDark && {
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderColor: "rgba(59, 130, 246, 0.3)",
                },
              ]}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveTag(index)}
                style={styles.removeTagBtn}
              >
                <Ionicons name="close" size={14} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.benefitsHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Beneficios y Funciones
          </Text>
          <TouchableOpacity onPress={handleAddBenefit}>
            <Text style={styles.addLink}>+ Añadir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.benefitsList}>
          {benefits.map((benefit) => (
            <View
              key={benefit.id}
              style={[
                styles.benefitRow,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
              <TextInput
                style={[styles.benefitInput, { color: textColor }]}
                value={benefit.text}
                onChangeText={(text) => handleUpdateBenefit(benefit.id, text)}
                placeholder="Descripción del beneficio"
                placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
              />
              <TouchableOpacity
                onPress={() => handleRemoveBenefit(benefit.id)}
                style={styles.deleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={isDark ? "#ef4444" : "#9ca3af"}
                />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.addBenefitRow,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                borderColor,
              },
            ]}
            onPress={handleAddBenefit}
          >
            <Ionicons name="add" size={20} color="#9ca3af" />
            <Text style={styles.addBenefitText}>Añadir nueva ventaja...</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Icono del Plan
        </Text>
        <View style={styles.iconRow}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                { backgroundColor: isDark ? "#1e293b" : "#f3f4f6" },
                selectedIcon === icon && styles.iconOptionSelected,
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <Ionicons
                name={icon}
                size={24}
                color={
                  selectedIcon === icon
                    ? "#fff"
                    : isDark
                      ? "#9ca3af"
                      : "#6b7280"
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Guardar Plan"
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={[
              styles.cancelButton,
              { backgroundColor: isDark ? "#334155" : "#f3f4f6" },
            ]}
            textStyle={{ color: isDark ? "#e2e8f0" : "#4b5563" }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9fafb",
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937",
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#111827",
    borderWidth: 3,
  },
  tagsInputRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: "#3b82f6",
    width: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  tagText: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "500",
    marginRight: 6,
  },
  removeTagBtn: {
    padding: 2,
  },
  benefitsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  addLink: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 14,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30, // Pill shape
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  benefitInput: {
    flex: 1,
    fontSize: 15,
    color: "#1f2937",
  },
  deleteButton: {
    padding: 4,
  },
  addBenefitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6", // Light gray background
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  addBenefitText: {
    color: "#6b7280",
    marginLeft: 12,
    fontSize: 15,
  },
  iconRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconOptionSelected: {
    backgroundColor: "#3b82f6",
  },
  footer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 30,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 30,
  },
});
