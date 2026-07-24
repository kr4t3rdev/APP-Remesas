import type React from "react";
import { useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	ScrollView,
	StyleSheet,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme";
import { useColors } from "../../store/themeStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ExpenseDatePickerProps = {
	value: string;
	onChange: (date: string) => void;
	label?: string;
	error?: string;
};

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

export const ExpenseDatePicker: React.FC<ExpenseDatePickerProps> = ({
	value,
	onChange,
	label = "Fecha",
	error,
}) => {
	const themeColors = useColors();
	const [showPicker, setShowPicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState(
		value ? new Date(value) : new Date(),
	);

	const dayRef = useRef<ScrollView>(null);
	const monthRef = useRef<ScrollView>(null);
	const yearRef = useRef<ScrollView>(null);

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

	const formatDisplayDate = (dateString: string) => {
		if (!dateString) return "Seleccionar fecha";
		const date = new Date(dateString);
		return date.toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
	};

	const handleConfirm = () => {
		onChange(selectedDate.toISOString().split("T")[0]);
		setShowPicker(false);
	};

	const handleOpen = () => {
		setSelectedDate(value ? new Date(value) : new Date());
		setShowPicker(true);
	};

	const scrollToSelected = (
		ref: React.RefObject<ScrollView | null>,
		index: number,
	) => {
		setTimeout(() => {
			ref.current?.scrollTo({ y: index * 40 - 80, animated: false });
		}, 100);
	};

	const handleDaySelect = (day: number) => {
		const newDate = new Date(selectedDate);
		newDate.setDate(day);
		setSelectedDate(newDate);
	};

	const handleMonthSelect = (index: number) => {
		const newDate = new Date(selectedDate);
		newDate.setMonth(index);
		setSelectedDate(newDate);
	};

	const handleYearSelect = (year: number) => {
		const newDate = new Date(selectedDate);
		newDate.setFullYear(year);
		setSelectedDate(newDate);
	};

	const selectedDay = selectedDate.getDate();
	const selectedMonth = selectedDate.getMonth();
	const selectedYear = selectedDate.getFullYear();

	return (
		<View style={styles.container}>
			<Text style={[styles.label, { color: themeColors.text.primary }]}>
				{label}
			</Text>
			<TouchableOpacity
				testID="expense-date-picker"
				onPress={handleOpen}
				style={[
					styles.inputContainer,
					{
						borderColor: error ? themeColors.danger : themeColors.border,
						backgroundColor: themeColors.card,
					},
				]}
			>
				<Ionicons
					name="calendar-outline"
					size={20}
					color={themeColors.text.secondary}
				/>
				<Text
					style={[
						styles.dateText,
						{
							color: value
								? themeColors.text.primary
								: themeColors.text.tertiary,
						},
					]}
				>
					{formatDisplayDate(value)}
				</Text>
			</TouchableOpacity>
			{error && (
				<Text style={[styles.error, { color: themeColors.danger }]}>
					{error}
				</Text>
			)}

			<Modal visible={showPicker} transparent animationType="slide">
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setShowPicker(false)}
				>
					<TouchableOpacity
						activeOpacity={1}
						onPress={() => {}}
						style={[styles.bottomSheet, { backgroundColor: themeColors.card }]}
					>
						{/* Drag handle */}
						<View style={styles.dragHandleWrapper}>
							<View
								style={[
									styles.dragHandle,
									{ backgroundColor: themeColors.text.tertiary },
								]}
							/>
						</View>

						{/* Header */}
						<View style={styles.modalHeader}>
							<TouchableOpacity onPress={() => setShowPicker(false)}>
								<Text
									style={[
										styles.cancelText,
										{ color: themeColors.text.secondary },
									]}
								>
									Cancelar
								</Text>
							</TouchableOpacity>
							<Text
								style={[styles.modalTitle, { color: themeColors.text.primary }]}
							>
								Seleccionar fecha
							</Text>
							<TouchableOpacity onPress={handleConfirm}>
								<Text
									style={[
										styles.confirmText,
										{ color: themeColors.primary[500] },
									]}
								>
									Listo
								</Text>
							</TouchableOpacity>
						</View>

						{/* Picker columns */}
						<View
							style={[
								styles.pickerArea,
								{ backgroundColor: themeColors.surface },
							]}
						>
							<View style={styles.pickerRow}>
								{/* Day column */}
								<View style={styles.pickerColumn}>
									<Text
										style={[
											styles.pickerLabel,
											{ color: themeColors.text.secondary },
										]}
									>
										Día
									</Text>
									<ScrollView
										ref={dayRef}
										style={styles.pickerScroll}
										showsVerticalScrollIndicator={false}
										onLayout={() => scrollToSelected(dayRef, selectedDay - 1)}
									>
										{DAYS.map((day) => (
											<TouchableOpacity
												key={day}
												style={[
													styles.pickerItem,
													selectedDay === day && {
														backgroundColor: themeColors.primary[500],
													},
												]}
												onPress={() => handleDaySelect(day)}
											>
												<Text
													style={[
														styles.pickerItemText,
														{
															color:
																selectedDay === day
																	? "#fff"
																	: themeColors.text.primary,
														},
													]}
												>
													{day}
												</Text>
											</TouchableOpacity>
										))}
										<View style={styles.scrollBottomSpacer} />
									</ScrollView>
								</View>

								{/* Month column */}
								<View style={styles.pickerColumn}>
									<Text
										style={[
											styles.pickerLabel,
											{ color: themeColors.text.secondary },
										]}
									>
										Mes
									</Text>
									<ScrollView
										ref={monthRef}
										style={styles.pickerScroll}
										showsVerticalScrollIndicator={false}
										onLayout={() => scrollToSelected(monthRef, selectedMonth)}
									>
										{MONTHS.map((month, index) => (
											<TouchableOpacity
												key={month}
												style={[
													styles.pickerItem,
													selectedMonth === index && {
														backgroundColor: themeColors.primary[500],
													},
												]}
												onPress={() => handleMonthSelect(index)}
											>
												<Text
													style={[
														styles.pickerItemText,
														{
															color:
																selectedMonth === index
																	? "#fff"
																	: themeColors.text.primary,
														},
													]}
												>
													{month.substring(0, 3)}
												</Text>
											</TouchableOpacity>
										))}
										<View style={styles.scrollBottomSpacer} />
									</ScrollView>
								</View>

								{/* Year column */}
								<View style={styles.pickerColumn}>
									<Text
										style={[
											styles.pickerLabel,
											{ color: themeColors.text.secondary },
										]}
									>
										Año
									</Text>
									<ScrollView
										ref={yearRef}
										style={styles.pickerScroll}
										showsVerticalScrollIndicator={false}
										onLayout={() =>
											scrollToSelected(yearRef, years.indexOf(selectedYear))
										}
									>
										{years.map((year) => (
											<TouchableOpacity
												key={year}
												style={[
													styles.pickerItem,
													selectedYear === year && {
														backgroundColor: themeColors.primary[500],
													},
												]}
												onPress={() => handleYearSelect(year)}
											>
												<Text
													style={[
														styles.pickerItemText,
														{
															color:
																selectedYear === year
																	? "#fff"
																	: themeColors.text.primary,
														},
													]}
												>
													{year}
												</Text>
											</TouchableOpacity>
										))}
										<View style={styles.scrollBottomSpacer} />
									</ScrollView>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: spacing.md,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		marginBottom: spacing.sm,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: borderRadius.md,
		borderWidth: 1,
		paddingVertical: 12,
		paddingHorizontal: spacing.md,
		gap: spacing.sm,
	},
	dateText: {
		fontSize: 16,
	},
	error: {
		fontSize: 12,
		marginTop: spacing.xs,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "flex-end",
	},
	bottomSheet: {
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		paddingBottom: spacing.xl,
		maxHeight: SCREEN_HEIGHT * 0.6,
	},
	dragHandleWrapper: {
		alignItems: "center",
		paddingVertical: spacing.sm,
	},
	dragHandle: {
		width: 36,
		height: 4,
		borderRadius: 2,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: "600",
	},
	cancelText: {
		fontSize: 15,
	},
	confirmText: {
		fontSize: 15,
		fontWeight: "600",
	},
	pickerArea: {
		marginHorizontal: spacing.md,
		borderRadius: borderRadius.lg,
		overflow: "hidden",
	},
	pickerRow: {
		flexDirection: "row",
	},
	pickerColumn: {
		flex: 1,
		borderRightWidth: StyleSheet.hairlineWidth,
		borderRightColor: "rgba(128,128,128,0.2)",
	},
	pickerLabel: {
		fontSize: 11,
		fontWeight: "600",
		textAlign: "center",
		paddingVertical: spacing.sm,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	pickerScroll: {
		maxHeight: 220,
	},
	pickerItem: {
		paddingVertical: 10,
		alignItems: "center",
		borderRadius: 0,
		marginHorizontal: 4,
		marginBottom: 1,
	},
	pickerItemText: {
		fontSize: 15,
		fontWeight: "500",
	},
	scrollBottomSpacer: {
		height: 80,
	},
	confirmButton: {
		marginTop: spacing.lg,
		marginHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		borderRadius: borderRadius.md,
		alignItems: "center",
	},
	confirmButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
