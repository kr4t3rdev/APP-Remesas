import type React from "react";
import { useState } from "react";
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useColors } from "../../store/themeStore";
import { validatePassword } from "../../utils/validators";
import { borderRadius, spacing } from "../../theme";

type ChangePasswordModalProps = {
	visible: boolean;
	onClose: () => void;
	onChangePassword: (
		currentPassword: string,
		newPassword: string,
	) => Promise<void>;
};

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
	visible,
	onClose,
	onChangePassword,
}) => {
	const colors = useColors();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const hasUppercase = /[A-Z]/.test(newPassword);
	const hasLowercase = /[a-z]/.test(newPassword);
	const hasNumber = /\d/.test(newPassword);

	const requirements = [
		{ label: "Mínimo 8 caracteres", met: newPassword.length >= 8 },
		{ label: "Al menos una mayúscula", met: hasUppercase },
		{ label: "Al menos una minúscula", met: hasLowercase },
		{ label: "Al menos un número", met: hasNumber },
	];

	const handleSubmit = async () => {
		if (!currentPassword || !newPassword) {
			setError("Complete todos los campos");
			return;
		}

		if (!validatePassword(newPassword)) {
			setError(
				"La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula y número",
			);
			return;
		}

		setLoading(true);
		setError("");
		try {
			await onChangePassword(currentPassword, newPassword);
			setCurrentPassword("");
			setNewPassword("");
			onClose();
		} catch (err: any) {
			setError(err.response?.data?.message || "Error al cambiar contraseña");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setCurrentPassword("");
		setNewPassword("");
		setError("");
		onClose();
	};

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.overlay}>
				<View style={styles.bottomAnchor}>
					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : "height"}
					>
						<View style={[styles.container, { backgroundColor: colors.card }]}>
							<View style={styles.handleContainer}>
								<View
									style={[
										styles.handle,
										{ backgroundColor: colors.text.secondary },
									]}
								/>
							</View>

							<View style={styles.header}>
								<Text style={[styles.title, { color: colors.text.primary }]}>
									Cambiar Contraseña
								</Text>
								<TouchableOpacity
									onPress={handleClose}
									style={styles.closeButton}
								>
									<Ionicons
										name="close"
										size={24}
										color={colors.text.primary}
									/>
								</TouchableOpacity>
							</View>

							<ScrollView
								style={styles.content}
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
							>
								{error ? (
									<View
										style={[
											styles.errorBox,
											{ backgroundColor: `${colors.danger}15` },
										]}
									>
										<Ionicons
											name="alert-circle"
											size={16}
											color={colors.danger}
										/>
										<Text style={[styles.errorText, { color: colors.danger }]}>
											{error}
										</Text>
									</View>
								) : null}

								<Input
									label="Contraseña Actual"
									placeholder="••••••••"
									value={currentPassword}
									onChangeText={setCurrentPassword}
									secureTextEntry
								/>

								<View style={{ marginTop: spacing.sm }}>
									<Input
										label="Nueva Contraseña"
										placeholder="••••••••"
										value={newPassword}
										onChangeText={setNewPassword}
										secureTextEntry
									/>
								</View>

								<View
									style={[
										styles.requirements,
										{ backgroundColor: colors.background },
									]}
								>
									<Text
										style={[
											styles.requirementsTitle,
											{ color: colors.text.secondary },
										]}
									>
										Requisitos:
									</Text>
									{requirements.map((req) => (
										<View key={req.label} style={styles.requirement}>
											<Ionicons
												name={req.met ? "checkmark-circle" : "close-circle"}
												size={14}
												color={
													req.met ? colors.primary[500] : colors.text.secondary
												}
											/>
											<Text
												style={[
													styles.requirementText,
													{
														color: req.met
															? colors.primary[500]
															: colors.text.secondary,
													},
												]}
											>
												{req.label}
											</Text>
										</View>
									))}
								</View>
							</ScrollView>

							<View style={styles.footer}>
								<Button
									title="Cancelar"
									variant="outline"
									onPress={handleClose}
									style={{ flex: 1 }}
								/>
								<Button
									title="Guardar"
									onPress={handleSubmit}
									loading={loading}
									disabled={loading}
									style={{ flex: 1 }}
								/>
							</View>
						</View>
					</KeyboardAvoidingView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
	},
	bottomAnchor: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		maxHeight: "90%",
	},
	container: {
		borderTopLeftRadius: borderRadius.xl,
		borderTopRightRadius: borderRadius.xl,
		maxHeight: "90%",
	},
	handleContainer: {
		alignItems: "center",
		paddingTop: spacing.sm,
	},
	handle: {
		width: 36,
		height: 4,
		borderRadius: 2,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: spacing.lg,
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
	},
	closeButton: {
		padding: spacing.xs,
	},
	content: {
		paddingHorizontal: spacing.lg,
	},
	errorBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		padding: spacing.sm,
		borderRadius: borderRadius.md,
		marginBottom: spacing.md,
	},
	errorText: {
		fontSize: 13,
		flex: 1,
	},
	requirements: {
		borderRadius: borderRadius.lg,
		padding: spacing.md,
		marginTop: spacing.md,
	},
	requirementsTitle: {
		fontSize: 12,
		fontWeight: "600",
		marginBottom: spacing.sm,
	},
	requirement: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	requirementText: {
		fontSize: 12,
		marginLeft: spacing.xs,
	},
	footer: {
		flexDirection: "row",
		gap: spacing.md,
		padding: spacing.lg,
		paddingTop: spacing.md,
	},
});
