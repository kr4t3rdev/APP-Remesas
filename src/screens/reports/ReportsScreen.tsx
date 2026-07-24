import type React from "react";
import { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	RefreshControl,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
	FadeIn,
	FadeInDown,
	ScaleIn,
	PressableScale,
} from "../../components/animations";
import {
	BarChart,
	HorizontalBarChart,
	StatsCard,
} from "../../components/charts/Charts";
import { ExpenseDatePicker } from "../../components/expenses/ExpenseDatePicker";
import { spacing, borderRadius } from "../../theme";
import { floatingTabBarMetrics } from "../../navigation/fintechTabBar";
import {
	useColors,
	useShadows,
	useGradients,
	useIsDark,
} from "../../store/themeStore";
import { format, subDays } from "date-fns";
import {
	useReportsCashBalancesQuery,
	useReportsCashFlowQuery,
	useReportsDailyReportQuery,
	useReportsPeriodQuery,
	useReportsProfitQuery,
} from "../../modules/reports/application/useReports";
import { ProfileFeatureBackButton } from "../profile/ProfileFeatureBackButton";
import { CashFlowCurrencyCards } from "../../components/reports/CashFlowCurrencyCards";
import {
	getReportRangeError,
	isReportRangeValid,
} from "../../modules/reports/application/reportDateRange";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ReportType = "daily" | "period" | "profit" | "cash-flow";

interface ReportCardData {
	id: ReportType;
	title: string;
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
	color: string;
	gradientColors: string[];
}

export const ReportsScreen: React.FC = () => {
	const themeColors = useColors();
	const themeShadows = useShadows();
	const gradients = useGradients();
	const isDark = useIsDark();

	const [selectedReport, setSelectedReport] = useState<ReportType>("daily");
	const [selectedDate] = useState(new Date());
	const [periodStart, setPeriodStart] = useState(
		subDays(new Date(), 7).toISOString().split("T")[0],
	);
	const [periodEnd, setPeriodEnd] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [profitStart, setProfitStart] = useState(
		subDays(new Date(), 7).toISOString().split("T")[0],
	);
	const [profitEnd, setProfitEnd] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [cashFlowStart, setCashFlowStart] = useState(
		subDays(new Date(), 7).toISOString().split("T")[0],
	);
	const [cashFlowEnd, setCashFlowEnd] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [periodError, setPeriodError] = useState<string | null>(null);
	const [profitError, setProfitError] = useState<string | null>(null);
	const [cashFlowError, setCashFlowError] = useState<string | null>(null);

	const dailyReportQuery = useReportsDailyReportQuery(selectedDate);
	const cashBalancesQuery = useReportsCashBalancesQuery();
	const periodReportQuery = useReportsPeriodQuery(
		periodStart,
		periodEnd,
		isReportRangeValid(periodStart, periodEnd),
	);
	const profitReportQuery = useReportsProfitQuery(
		profitStart,
		profitEnd,
		isReportRangeValid(profitStart, profitEnd),
	);
	const cashFlowReportQuery = useReportsCashFlowQuery(
		cashFlowStart,
		cashFlowEnd,
		isReportRangeValid(cashFlowStart, cashFlowEnd),
	);

	const dailyReport = dailyReportQuery.data;
	const periodReport = periodReportQuery.data;
	const cashBalances = cashBalancesQuery.data ?? [];
	const safeDailyReport = dailyReport ?? {
		profit: { net: 0, margin: 0, marginProfit: 0 },
		transactions: {
			total: 0,
			compras: 0,
			ventas: 0,
			totalCompras: 0,
			totalVentas: 0,
		},
		expenses: {
			totalAmount: 0,
			total: 0,
			totalAmountInCup: null,
			unconvertedCount: 0,
			byCategory: {},
		},
	};

	const handleRefresh = async () => {
		await Promise.all([
			dailyReportQuery.refetch(),
			cashBalancesQuery.refetch(),
			periodReportQuery.refetch(),
			profitReportQuery.refetch(),
			cashFlowReportQuery.refetch(),
		]);
	};

	const validateAndSetError = (
		start: string,
		end: string,
		setError: (err: string | null) => void,
	): boolean => {
		const error = getReportRangeError(start, end);
		setError(error);
		return error === null;
	};

	const handleCashFlowStartChange = (date: string) => {
		setCashFlowStart(date);
		validateAndSetError(date, cashFlowEnd, setCashFlowError);
	};

	const handleCashFlowEndChange = (date: string) => {
		setCashFlowEnd(date);
		validateAndSetError(cashFlowStart, date, setCashFlowError);
	};

	const handleProfitStartChange = (date: string) => {
		setProfitStart(date);
		validateAndSetError(date, profitEnd, setProfitError);
	};

	const handleProfitEndChange = (date: string) => {
		setProfitEnd(date);
		validateAndSetError(profitStart, date, setProfitError);
	};

	const formatNumber = (value: number | string) => {
		const num = Number(value) || 0;
		return num.toLocaleString("es-CU", { minimumFractionDigits: 2 });
	};

	const handlePeriodStartChange = (date: string) => {
		setPeriodStart(date);
		validateAndSetError(date, periodEnd, setPeriodError);
	};

	const handlePeriodEndChange = (date: string) => {
		setPeriodEnd(date);
		validateAndSetError(periodStart, date, setPeriodError);
	};

	const getGradientColors = (reportType: ReportType) => {
		const gradientKey =
			reportType === "period"
				? "period"
				: reportType === "profit"
					? "profit"
					: reportType === "cash-flow"
						? "cashFlow"
						: "daily";
		return isDark ? gradients[gradientKey].dark : gradients[gradientKey].light;
	};

	const reports: ReportCardData[] = [
		{
			id: "daily",
			title: "Diario",
			description: "Resumen del día",
			icon: "today",
			color: themeColors.primary[500],
			gradientColors: getGradientColors("daily"),
		},
		{
			id: "period",
			title: "Por Período",
			description: "Análisis entre fechas",
			icon: "calendar",
			color: themeColors.warning,
			gradientColors: getGradientColors("period"),
		},
		{
			id: "profit",
			title: "Ganancias",
			description: "Margen de utilidades",
			icon: "trending-up",
			color: themeColors.success,
			gradientColors: getGradientColors("profit"),
		},
		{
			id: "cash-flow",
			title: "Flujo de Caja",
			description: "Entradas y salidas",
			icon: "swap-vertical",
			color: themeColors.secondary[500],
			gradientColors: getGradientColors("cash-flow"),
		},
	];

	const transactionChartData = dailyReport
		? [
				{
					label: "Compras",
					value: safeDailyReport.transactions.compras,
					color: themeColors.financial.compra,
				},
				{
					label: "Ventas",
					value: safeDailyReport.transactions.ventas,
					color: themeColors.financial.venta,
				},
			]
		: [];

	const expenseCategoryData = safeDailyReport.expenses.byCategory
		? Object.entries(safeDailyReport.expenses.byCategory).map(
				([category, data]) => ({
					label: category.charAt(0).toUpperCase() + category.slice(1),
					value: data?.total ?? 0,
					color:
						themeColors.dashboard.categories?.[
							category as keyof typeof themeColors.dashboard.categories
						]?.icon || themeColors.text.secondary,
				}),
			)
		: [];

	const balanceChartData = cashBalances.slice(0, 4).map((b) => ({
		label: b.currency?.code || "",
		value: Math.abs(Number(b.balance)),
		color:
			b.currency?.code === "USD"
				? themeColors.currencies.usd.primary
				: b.currency?.code === "EUR"
					? themeColors.currencies.eur.primary
					: b.currency?.code === "MLC"
						? themeColors.currencies.mlc.primary
						: themeColors.primary[500],
	}));

	// Period Report data transformation
	const periodDailyChartData = periodReport?.dailyBreakdown
		? periodReport.dailyBreakdown.map((item) => ({
				label: format(new Date(item.date), "dd/MM"),
				value: item.marginProfit,
				color: themeColors.primary[500],
			}))
		: [];

	const periodExpenseCategoryData = periodReport?.expensesByCategory
		? Object.entries(periodReport.expensesByCategory).map(
				([category, data]) => ({
					label: category.charAt(0).toUpperCase() + category.slice(1),
					value: data.total,
					color:
						themeColors.dashboard.categories?.[
							category as keyof typeof themeColors.dashboard.categories
						]?.icon || themeColors.text.secondary,
				}),
			)
		: [];

	const isPeriodLoading = periodReportQuery.isLoading;
	const isPeriodError = !!periodReportQuery.error;

	const renderReportCard = (report: ReportCardData, index: number) => {
		const isSelected = selectedReport === report.id;
		const gradientColors = getGradientColors(report.id);

		return (
			<PressableScale
				key={report.id}
				onPress={() => {
					setSelectedReport(report.id);
				}}
				style={styles.reportCardWrapper}
			>
				<View
					style={[
						styles.reportCard,
						isSelected && {
							borderColor: gradientColors[0],
							backgroundColor: isDark
								? "rgba(30, 41, 59, 0.95)"
								: "rgba(255, 255, 255, 0.95)",
						},
						!isSelected && { backgroundColor: themeColors.card },
					]}
				>
					{isSelected && (
						<View
							style={[
								styles.gradientAccent,
								{ backgroundColor: gradientColors[0] },
							]}
						/>
					)}
					<View
						style={[
							styles.reportIcon,
							{ backgroundColor: `${report.color}20` },
						]}
					>
						<Ionicons name={report.icon} size={22} color={report.color} />
					</View>
					<Text
						style={[
							styles.reportTitle,
							isSelected && { color: gradientColors[0] },
						]}
					>
						{report.title}
					</Text>
					<Text style={styles.reportDesc}>{report.description}</Text>
					{isSelected && (
						<View
							style={[
								styles.selectedIndicator,
								{ backgroundColor: gradientColors[0] },
							]}
						/>
					)}
				</View>
			</PressableScale>
		);
	};

	const renderDailyReport = () => {
		if (!dailyReport) return null;

		return (
			<>
				<View style={styles.statsGrid}>
					<ScaleIn delay={100}>
						<View
							style={[
								styles.statsCardWrapper,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<StatsCard
								title="Ganancia Neta"
								value={`$ ${formatNumber(safeDailyReport.profit.net)}`}
								icon={
									<Ionicons
										name="trending-up"
										size={20}
										color={themeColors.success}
									/>
								}
								color={themeColors.success}
								trend={
									safeDailyReport.profit.net > 0
										? "up"
										: safeDailyReport.profit.net < 0
											? "down"
											: "neutral"
								}
								style={styles.statCard}
							/>
						</View>
					</ScaleIn>
					<ScaleIn delay={150}>
						<View
							style={[
								styles.statsCardWrapper,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<StatsCard
								title="Transacciones"
								value={safeDailyReport.transactions.total.toString()}
								subtitle={`${safeDailyReport.transactions.compras} compras, ${safeDailyReport.transactions.ventas} ventas`}
								icon={
									<Ionicons
										name="swap-horizontal"
										size={20}
										color={themeColors.primary[500]}
									/>
								}
								color={themeColors.primary[500]}
								style={styles.statCard}
							/>
						</View>
					</ScaleIn>
				</View>

				<View style={styles.statsGrid}>
					<ScaleIn delay={200}>
						<View
							style={[
								styles.statsCardWrapper,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<StatsCard
								title="Total Compras"
								value={`$ ${formatNumber(safeDailyReport.transactions.totalCompras)}`}
								icon={
									<Ionicons
										name="arrow-down-circle"
										size={20}
										color={themeColors.financial.compra}
									/>
								}
								color={themeColors.financial.compra}
								style={styles.statCard}
							/>
						</View>
					</ScaleIn>
					<ScaleIn delay={250}>
						<View
							style={[
								styles.statsCardWrapper,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<StatsCard
								title="Total Ventas"
								value={`$ ${formatNumber(safeDailyReport.transactions.totalVentas)}`}
								icon={
									<Ionicons
										name="arrow-up-circle"
										size={20}
										color={themeColors.financial.venta}
									/>
								}
								color={themeColors.financial.venta}
								style={styles.statCard}
							/>
						</View>
					</ScaleIn>
				</View>

				<FadeInDown delay={300}>
					<View
						style={[
							styles.section,
							{ backgroundColor: themeColors.card },
							themeShadows.md,
						]}
					>
						<Text
							style={[styles.sectionTitle, { color: themeColors.text.primary }]}
						>
							Compras vs Ventas
						</Text>
						<View style={styles.chartCard}>
							<BarChart
								data={transactionChartData}
								height={100}
								showLabels
								showValues
								maxValue={Math.max(
									safeDailyReport.transactions.compras,
									safeDailyReport.transactions.ventas,
									5,
								)}
							/>
						</View>
					</View>
				</FadeInDown>

				<FadeInDown delay={350}>
					<View
						style={[
							styles.section,
							{ backgroundColor: themeColors.card },
							themeShadows.md,
						]}
					>
						<Text
							style={[styles.sectionTitle, { color: themeColors.text.primary }]}
						>
							Gastos
						</Text>
						<View style={styles.statsRow}>
							<View style={styles.expenseStat}>
								<Text
									style={[
										styles.expenseLabel,
										{ color: themeColors.text.secondary },
									]}
								>
									Total Gastos
									{safeDailyReport.expenses.totalAmountInCup !== null
										? " (CUP)"
										: ""}
								</Text>
								<Text
									style={[
										styles.expenseValue,
										{ color: themeColors.text.primary },
									]}
								>
									${" "}
									{formatNumber(
										safeDailyReport.expenses.totalAmountInCup !== null
											? safeDailyReport.expenses.totalAmountInCup
											: safeDailyReport.expenses.totalAmount,
									)}
								</Text>
								{safeDailyReport.expenses.unconvertedCount > 0 && (
									<Text
										style={[
											styles.expenseLabel,
											{
												color: themeColors.warning,
												marginTop: 2,
												fontSize: 11,
											},
										]}
									>
										{safeDailyReport.expenses.unconvertedCount} sin tasa
									</Text>
								)}
							</View>
							<View style={styles.expenseStat}>
								<Text
									style={[
										styles.expenseLabel,
										{ color: themeColors.text.secondary },
									]}
								>
									Cantidad
								</Text>
								<Text
									style={[
										styles.expenseValue,
										{ color: themeColors.text.primary },
									]}
								>
									{safeDailyReport.expenses.total}
								</Text>
							</View>
						</View>
						{expenseCategoryData.length > 0 && (
							<View style={[styles.chartCard, { marginTop: spacing.md }]}>
								<HorizontalBarChart
									data={expenseCategoryData}
									maxValue={Math.max(
										...expenseCategoryData.map((d) => d.value),
										100,
									)}
								/>
							</View>
						)}
					</View>
				</FadeInDown>
			</>
		);
	};

	const renderPeriodReport = () => {
		// Loading state
		if (isPeriodLoading) {
			return (
				<FadeInDown>
					<View style={styles.section}>
						<View
							style={[
								styles.dateRangeCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={periodStart}
									onChange={handlePeriodStartChange}
									label="Desde"
								/>
							</View>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={periodEnd}
									onChange={handlePeriodEndChange}
									label="Hasta"
									error={periodError || undefined}
								/>
							</View>
						</View>
						<View
							style={[
								styles.chartCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
								{ padding: spacing.xl },
							]}
						>
							<View style={styles.emptyState}>
								<Ionicons
									name="hourglass-outline"
									size={48}
									color={themeColors.text.tertiary}
								/>
								<Text
									style={[
										styles.emptyTitle,
										{ color: themeColors.text.primary },
									]}
								>
									Cargando...
								</Text>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									Obteniendo datos del período
								</Text>
							</View>
						</View>
					</View>
				</FadeInDown>
			);
		}

		// Error state
		if (isPeriodError) {
			return (
				<FadeInDown>
					<View style={styles.section}>
						<View
							style={[
								styles.dateRangeCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={periodStart}
									onChange={handlePeriodStartChange}
									label="Desde"
								/>
							</View>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={periodEnd}
									onChange={handlePeriodEndChange}
									label="Hasta"
									error={periodError || undefined}
								/>
							</View>
						</View>
						<View
							style={[
								styles.chartCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
								{ padding: spacing.xl },
							]}
						>
							<View style={styles.emptyState}>
								<Ionicons
									name="alert-circle-outline"
									size={48}
									color={themeColors.danger}
								/>
								<Text
									style={[
										styles.emptyTitle,
										{ color: themeColors.text.primary },
									]}
								>
									Error
								</Text>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									No se pudo cargar el reporte. Intenta de nuevo.
								</Text>
							</View>
						</View>
					</View>
				</FadeInDown>
			);
		}

		// No data state
		if (!periodReport || !periodReport.summary) {
			return (
				<FadeInDown>
					<View style={styles.section}>
						<View
							style={[
								styles.dateRangeCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={periodStart}
									onChange={handlePeriodStartChange}
									label="Desde"
								/>
							</View>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={periodEnd}
									onChange={handlePeriodEndChange}
									label="Hasta"
									error={periodError || undefined}
								/>
							</View>
						</View>
						<View
							style={[
								styles.chartCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
								{ padding: spacing.xl },
							]}
						>
							<View style={styles.emptyState}>
								<Ionicons
									name="calendar-outline"
									size={48}
									color={themeColors.text.tertiary}
								/>
								<Text
									style={[
										styles.emptyTitle,
										{ color: themeColors.text.primary },
									]}
								>
									Sin datos
								</Text>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									No hay transacciones en este período
								</Text>
							</View>
						</View>
					</View>
				</FadeInDown>
			);
		}

		// Data loaded - show report
		return (
			<>
				<FadeInDown>
					<View style={styles.section}>
						<View
							style={[
								styles.dateRangeCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={periodStart}
									onChange={handlePeriodStartChange}
									label="Desde"
								/>
							</View>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={periodEnd}
									onChange={handlePeriodEndChange}
									label="Hasta"
									error={periodError || undefined}
								/>
							</View>
						</View>
					</View>
				</FadeInDown>

				{/* Summary Cards */}
				<FadeInDown delay={50}>
					<View style={styles.statsGrid}>
						<ScaleIn delay={100}>
							<View
								style={[
									styles.statsCardWrapper,
									{ backgroundColor: themeColors.card },
									themeShadows.md,
								]}
							>
								<StatsCard
									title="Transacciones"
									value={periodReport.summary.totalTransactions.toString()}
									icon={
										<Ionicons
											name="swap-horizontal"
											size={20}
											color={themeColors.primary[500]}
										/>
									}
									color={themeColors.primary[500]}
									style={styles.statCard}
								/>
							</View>
						</ScaleIn>
						<ScaleIn delay={150}>
							<View
								style={[
									styles.statsCardWrapper,
									{ backgroundColor: themeColors.card },
									themeShadows.md,
								]}
							>
								<StatsCard
									title="Gastos"
									value={`$ ${formatNumber(
										periodReport.summary.totalExpensesInCup !== null
											? periodReport.summary.totalExpensesInCup
											: periodReport.summary.totalExpensesAmount,
									)}`}
									subtitle={`${periodReport.summary.totalExpensesCount} gastos${
										periodReport.summary.unconvertedExpensesCount > 0
											? ` · ${periodReport.summary.unconvertedExpensesCount} sin tasa`
											: ""
									}`}
									icon={
										<Ionicons
											name="arrow-up-circle"
											size={20}
											color={themeColors.danger}
										/>
									}
									color={themeColors.danger}
									style={styles.statCard}
								/>
							</View>
						</ScaleIn>
					</View>
				</FadeInDown>

				<FadeInDown delay={100}>
					<View style={styles.statsGrid}>
						<ScaleIn delay={200}>
							<View
								style={[
									styles.statsCardWrapper,
									{ backgroundColor: themeColors.card },
									themeShadows.md,
								]}
							>
								<StatsCard
									title="Ganancia Neta"
									value={`$ ${formatNumber(periodReport.summary.netProfit)}`}
									subtitle={`Margen: $ ${formatNumber(periodReport.summary.marginProfit)}`}
									icon={
										<Ionicons
											name="trending-up"
											size={20}
											color={themeColors.success}
										/>
									}
									color={themeColors.success}
									trend={
										periodReport.summary.netProfit > 0
											? "up"
											: periodReport.summary.netProfit < 0
												? "down"
												: "neutral"
									}
									style={styles.statCard}
								/>
							</View>
						</ScaleIn>
					</View>
				</FadeInDown>

				{/* Daily Breakdown Chart */}
				{periodDailyChartData.length > 0 && (
					<FadeInDown delay={150}>
						<View
							style={[
								styles.section,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<Text
								style={[
									styles.sectionTitle,
									{ color: themeColors.text.primary },
								]}
							>
								Ganancia Diaria (CUP)
							</Text>
							<View style={styles.chartCard}>
								<BarChart
									data={periodDailyChartData}
									height={120}
									showLabels
									showValues
									maxValue={Math.max(
										...periodDailyChartData.map((d) => d.value),
										10,
									)}
								/>
							</View>
						</View>
					</FadeInDown>
				)}

				{/* Expenses by Category */}
				{periodExpenseCategoryData.length > 0 && (
					<FadeInDown delay={200}>
						<View
							style={[
								styles.section,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<Text
								style={[
									styles.sectionTitle,
									{ color: themeColors.text.primary },
								]}
							>
								Gastos por Categoría
							</Text>
							<View style={styles.chartCard}>
								<HorizontalBarChart
									data={periodExpenseCategoryData}
									maxValue={Math.max(
										...periodExpenseCategoryData.map((d) => d.value),
										100,
									)}
								/>
							</View>
						</View>
					</FadeInDown>
				)}
			</>
		);
	};

	const renderProfitReport = () => {
		const profitReport = profitReportQuery.data;
		const marginPct =
			profitReport && profitReport.totalVentas > 0
				? (profitReport.totalMarginProfit / profitReport.totalVentas) * 100
				: 0;
		const hasData =
			profitReport &&
			(profitReport.totalMarginProfit !== 0 || profitReport.totalVentas > 0);

		const profitByCurrency = profitReport
			? Object.entries(profitReport.byCurrency).map(([code, data]) => ({
					label: code,
					value: data.marginProfit,
					count: data.count,
				}))
			: [];

		return (
			<>
				<FadeInDown>
					<View style={styles.section}>
						<View
							style={[
								styles.dateRangeCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={profitStart}
									onChange={handleProfitStartChange}
									label="Desde"
								/>
							</View>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={profitEnd}
									onChange={handleProfitEndChange}
									label="Hasta"
									error={profitError || undefined}
								/>
							</View>
						</View>
					</View>
				</FadeInDown>

				<FadeInDown delay={100}>
					<View
						style={[
							styles.section,
							{ backgroundColor: themeColors.card },
							themeShadows.lg,
						]}
					>
						<View
							style={[
								styles.profitHeader,
								{ borderBottomColor: themeColors.border },
							]}
						>
							<Text
								style={[
									styles.sectionTitle,
									{ color: themeColors.text.primary },
								]}
							>
								Margen de Ganancias
							</Text>
							<View
								style={[
									styles.profitBadge,
									{ backgroundColor: `${themeColors.success}20` },
								]}
							>
								<Ionicons
									name="trending-up"
									size={16}
									color={themeColors.success}
								/>
								<Text
									style={[
										styles.profitBadgeText,
										{ color: themeColors.success },
									]}
								>
									{profitReport ? `${marginPct.toFixed(1)}%` : "0%"}
								</Text>
							</View>
						</View>
						{profitReportQuery.isLoading ? (
							<View style={styles.emptyState}>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									Cargando...
								</Text>
							</View>
						) : profitReportQuery.isError ? (
							<View style={styles.emptyState}>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									No se pudo cargar el reporte. Intenta de nuevo.
								</Text>
							</View>
						) : !hasData ? (
							<View style={styles.emptyState}>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									No hay transacciones en este período
								</Text>
							</View>
						) : (
							<>
								<View style={styles.statsGrid}>
									<View
										style={[
											styles.statsCardWrapper,
											{ backgroundColor: themeColors.card },
											themeShadows.md,
										]}
									>
										<StatsCard
											title="Margen FX"
											value={`$ ${formatNumber(profitReport!.totalMarginProfit)}`}
											icon={
												<Ionicons
													name="cash-outline"
													size={20}
													color={themeColors.success}
												/>
											}
											color={themeColors.success}
											style={styles.statCard}
										/>
									</View>
									<View
										style={[
											styles.statsCardWrapper,
											{ backgroundColor: themeColors.card },
											themeShadows.md,
										]}
									>
										<StatsCard
											title="Flow neto"
											value={`$ ${formatNumber(profitReport!.netFlow)}`}
											icon={
												<Ionicons
													name="swap-vertical"
													size={20}
													color={
														profitReport!.netFlow >= 0
															? themeColors.success
															: themeColors.danger
													}
												/>
											}
											color={
												profitReport!.netFlow >= 0
													? themeColors.success
													: themeColors.danger
											}
											style={styles.statCard}
										/>
									</View>
								</View>
								<View
									style={[
										styles.statsCardWrapper,
										{
											backgroundColor: themeColors.card,
											marginTop: spacing.md,
										},
										themeShadows.md,
									]}
								>
									<StatsCard
										title="Compras vs Ventas"
										value={`$ ${formatNumber(profitReport!.totalVentas)}`}
										subtitle={`Compras: $ ${formatNumber(profitReport!.totalCompras)}`}
										icon={
											<Ionicons
												name="trending-up"
												size={20}
												color={themeColors.primary[500]}
											/>
										}
										color={themeColors.primary[500]}
										style={styles.statCard}
									/>
								</View>
							</>
						)}
					</View>
				</FadeInDown>

				{profitByCurrency.length > 0 && (
					<FadeInDown delay={150}>
						<View
							style={[
								styles.section,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<Text
								style={[
									styles.sectionTitle,
									{ color: themeColors.text.primary },
								]}
							>
								Ganancia por Moneda
							</Text>
							<View style={styles.chartCard}>
								<HorizontalBarChart
									data={profitByCurrency.map((d) => ({
										label: `${d.label} (${d.count})`,
										value: d.value,
										color: themeColors.success,
									}))}
									maxValue={Math.max(
										...profitByCurrency.map((d) => Math.abs(d.value)),
										100,
									)}
								/>
							</View>
						</View>
					</FadeInDown>
				)}

				<FadeInDown delay={200}>
					<View
						style={[
							styles.section,
							{ backgroundColor: themeColors.card },
							themeShadows.md,
						]}
					>
						<Text
							style={[styles.sectionTitle, { color: themeColors.text.primary }]}
						>
							Distribución de Saldos
						</Text>
						<View style={styles.chartCard}>
							{balanceChartData.length > 0 ? (
								<BarChart
									data={balanceChartData}
									height={100}
									showLabels
									showValues
								/>
							) : (
								<View style={styles.emptyState}>
									<Text
										style={[
											styles.emptySubtitle,
											{ color: themeColors.text.secondary },
										]}
									>
										No hay datos de saldo
									</Text>
								</View>
							)}
						</View>
					</View>
				</FadeInDown>
			</>
		);
	};

	const renderCashFlowReport = () => {
		const cashFlowReport = cashFlowReportQuery.data;
		const currencyBuckets = cashFlowReport?.currencies ?? [];
		const hasData = currencyBuckets.some(
			(bucket) => bucket.inflows.total > 0 || bucket.outflows.total > 0,
		);

		return (
			<>
				<FadeInDown>
					<View style={styles.section}>
						<View
							style={[
								styles.dateRangeCard,
								{ backgroundColor: themeColors.card },
								themeShadows.md,
							]}
						>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={cashFlowStart}
									onChange={handleCashFlowStartChange}
									label="Desde"
								/>
							</View>
							<View style={styles.dateField}>
								<ExpenseDatePicker
									value={cashFlowEnd}
									onChange={handleCashFlowEndChange}
									label="Hasta"
									error={cashFlowError || undefined}
								/>
							</View>
						</View>
					</View>
				</FadeInDown>

				<FadeInDown delay={50}>
					<View
						style={[
							styles.section,
							{ backgroundColor: themeColors.card },
							themeShadows.lg,
						]}
					>
						<Text
							style={[styles.sectionTitle, { color: themeColors.text.primary }]}
						>
							Flujo de Caja
						</Text>

						{cashFlowReportQuery.isLoading ? (
							<View style={styles.emptyState}>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									Cargando...
								</Text>
							</View>
						) : cashFlowReportQuery.isError ? (
							<View style={styles.emptyState}>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									No se pudo cargar el reporte. Intenta de nuevo.
								</Text>
							</View>
						) : !hasData ? (
							<View style={styles.emptyState}>
								<Text
									style={[
										styles.emptySubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									Sin movimientos en este período
								</Text>
							</View>
						) : (
							<>
								<CashFlowCurrencyCards
									currencies={currencyBuckets}
									colors={themeColors}
								/>
							</>
						)}
					</View>
				</FadeInDown>
			</>
		);
	};

	const renderContent = () => {
		switch (selectedReport) {
			case "daily":
				return renderDailyReport();
			case "period":
				return renderPeriodReport();
			case "profit":
				return renderProfitReport();
			case "cash-flow":
				return renderCashFlowReport();
			default:
				return renderDailyReport();
		}
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: themeColors.background }]}
		>
			<ProfileFeatureBackButton />
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				refreshControl={
					<RefreshControl
						refreshing={
							dailyReportQuery.isRefetching || cashBalancesQuery.isRefetching
						}
						onRefresh={handleRefresh}
						tintColor={themeColors.primary[500]}
					/>
				}
			>
				<FadeIn>
					<View style={styles.header}>
						<Text style={[styles.title, { color: themeColors.text.primary }]}>
							Reportes
						</Text>
						<Text
							style={[styles.subtitle, { color: themeColors.text.secondary }]}
						>
							Análisis y estadísticas
						</Text>
					</View>
				</FadeIn>

				<FadeInDown delay={50}>
					<View style={styles.reportsGrid}>
						{reports.map((report, index) => renderReportCard(report, index))}
					</View>
				</FadeInDown>

				{renderContent()}

				<FadeInDown delay={400}>
					<View style={styles.section}>
						<Text
							style={[styles.sectionTitle, { color: themeColors.text.primary }]}
						>
							Acciones
						</Text>
						<TouchableOpacity
							style={[
								styles.actionCard,
								{ backgroundColor: themeColors.card },
								themeShadows.sm,
							]}
							activeOpacity={0.7}
						>
							<View
								style={[
									styles.actionIcon,
									{ backgroundColor: themeColors.primary[50] },
								]}
							>
								<Ionicons
									name="document-text-outline"
									size={22}
									color={themeColors.primary[500]}
								/>
							</View>
							<View style={styles.actionInfo}>
								<Text
									style={[
										styles.actionTitle,
										{ color: themeColors.text.primary },
									]}
								>
									Exportar PDF
								</Text>
								<Text
									style={[
										styles.actionSubtitle,
										{ color: themeColors.text.secondary },
									]}
								>
									Descargar reporte en formato PDF
								</Text>
							</View>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={themeColors.text.tertiary}
							/>
						</TouchableOpacity>
					</View>
				</FadeInDown>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		padding: spacing.md,
		paddingBottom: floatingTabBarMetrics.contentBottomPadding,
	},
	header: {
		marginBottom: spacing.lg,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
	},
	subtitle: {
		fontSize: 14,
		marginTop: 4,
	},
	reportsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	reportCardWrapper: {
		width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2 - 4,
	},
	reportCard: {
		borderRadius: borderRadius.lg,
		padding: spacing.md,
		borderWidth: 2,
		borderColor: "transparent",
		minHeight: 120,
	},
	gradientAccent: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 3,
		borderTopLeftRadius: borderRadius.lg - 2,
		borderTopRightRadius: borderRadius.lg - 2,
	},
	reportIcon: {
		width: 44,
		height: 44,
		borderRadius: borderRadius.md,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: spacing.sm,
	},
	reportTitle: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 2,
	},
	reportDesc: {
		fontSize: 12,
		color: "#94A3B8",
	},
	selectedIndicator: {
		position: "absolute",
		bottom: spacing.sm,
		right: spacing.sm,
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	section: {
		marginBottom: spacing.lg,
		borderRadius: borderRadius.lg,
		padding: spacing.md,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: spacing.md,
	},
	statsGrid: {
		flexDirection: "row",
		gap: spacing.md,
		marginBottom: spacing.md,
	},
	statsCardWrapper: {
		flex: 1,
		borderRadius: borderRadius.lg,
		padding: spacing.sm,
	},
	statCard: {
		flex: 1,
	},
	chartCard: {
		borderRadius: borderRadius.lg,
		padding: spacing.sm,
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: spacing.md,
	},
	expenseStat: {
		alignItems: "center",
	},
	expenseLabel: {
		fontSize: 12,
		marginBottom: 4,
	},
	expenseValue: {
		fontSize: 20,
		fontWeight: "700",
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: spacing.xl,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginTop: spacing.md,
	},
	emptySubtitle: {
		fontSize: 14,
		marginTop: 4,
		textAlign: "center",
	},
	profitValue: {
		fontSize: 32,
		fontWeight: "700",
	},
	profitHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 1,
		paddingBottom: spacing.md,
		marginBottom: spacing.md,
	},
	profitBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
		borderRadius: borderRadius.full,
		gap: 4,
	},
	profitBadgeText: {
		fontSize: 12,
		fontWeight: "600",
	},
	profitContent: {
		alignItems: "center",
		paddingVertical: spacing.lg,
	},
	profitCircle: {
		width: 160,
		height: 160,
		borderRadius: 80,
		borderWidth: 4,
		justifyContent: "center",
		alignItems: "center",
	},
	profitLabel: {
		fontSize: 12,
		marginTop: 4,
	},
	dateRangeCard: {
		flexDirection: "row",
		borderRadius: borderRadius.lg,
		padding: spacing.md,
		gap: spacing.md,
		marginBottom: spacing.md,
	},
	dateField: {
		flex: 1,
	},
	dateLabel: {
		fontSize: 12,
		marginBottom: spacing.xs,
	},
	dateButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing.sm,
		borderRadius: borderRadius.md,
		gap: spacing.xs,
	},
	dateText: {
		fontSize: 14,
		fontWeight: "500",
	},
	flowSummary: {
		marginBottom: spacing.lg,
	},
	flowBalanceCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing.lg,
		borderRadius: borderRadius.lg,
		gap: spacing.md,
	},
	flowBalanceLabel: {
		fontSize: 14,
		flex: 1,
	},
	flowBalanceValue: {
		fontSize: 24,
		fontWeight: "700",
	},
	flowRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
	},
	flowItem: {
		flex: 1,
		alignItems: "center",
		padding: spacing.lg,
		borderRadius: borderRadius.lg,
	},
	flowIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: spacing.sm,
	},
	flowLabel: {
		fontSize: 13,
		marginBottom: 4,
	},
	flowValue: {
		fontSize: 18,
		fontWeight: "700",
	},
	flowDivider: {
		width: 1,
		height: 60,
	},
	actionCard: {
		borderRadius: borderRadius.lg,
		padding: spacing.md,
		flexDirection: "row",
		alignItems: "center",
	},
	actionIcon: {
		width: 44,
		height: 44,
		borderRadius: borderRadius.md,
		justifyContent: "center",
		alignItems: "center",
	},
	actionInfo: {
		flex: 1,
		marginLeft: spacing.md,
	},
	actionTitle: {
		fontSize: 16,
		fontWeight: "600",
	},
	actionSubtitle: {
		fontSize: 12,
		marginTop: 2,
	},
});
