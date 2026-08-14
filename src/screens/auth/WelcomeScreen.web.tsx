import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppLogo } from "../../components/branding/AppLogo";
import { useColors } from "../../store/themeStore";
import { webBreakpoints, webMetrics, webType } from "../../web/design/webTokens";

interface WelcomeScreenProps {
  navigation?: any;
}

type SectionId = "operaciones" | "control" | "acceso";

const capabilities = [
  {
    icon: "swap-horizontal-outline" as const,
    title: "FX multicurrency",
    body: "Registra monto, tasa y ganancia en cada compra o venta.",
  },
  {
    icon: "wallet-outline" as const,
    title: "Caja y bancos",
    body: "Conoce el saldo disponible por moneda antes de mover fondos.",
  },
  {
    icon: "trending-up-outline" as const,
    title: "Reportes claros",
    body: "Convierte a CUP con la tasa histórica y cierra el período con contexto.",
  },
];

const controlPoints = [
  "Saldos propios para cada trabajador",
  "Gastos vinculados a caja o cuenta bancaria",
  "Objetivos y resumen diario en una sola vista",
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isMobile = width < webBreakpoints.tablet;
  const isStacked = width < webBreakpoints.desktop;
  const styles = createStyles(colors, isMobile, isStacked);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<SectionId, number>>>({});
  const [reduceMotion, setReduceMotion] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!mounted) return;
        setReduceMotion(enabled);
        if (enabled) entrance.setValue(1);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [entrance]);

  useEffect(() => {
    if (reduceMotion) return;
    Animated.timing(entrance, {
      toValue: 1,
      duration: 520,
      delay: 60,
      useNativeDriver: false,
    }).start();
  }, [entrance, reduceMotion]);

  const goTo = (route: "Login" | "Register") => navigation?.navigate(route);
  const scrollTo = (section: SectionId) => {
    const offset = sectionOffsets.current[section];
    if (typeof offset === "number") scrollRef.current?.scrollTo({ y: offset, animated: !reduceMotion });
  };
  const registerSection = (section: SectionId) => (event: { nativeEvent: { layout: { y: number } } }) => {
    sectionOffsets.current[section] = event.nativeEvent.layout.y;
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ir al inicio"
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion })}
          style={styles.brand}
        >
          <AppLogo size={34} />
          <View>
            <Text style={styles.brandName}>Cashflow</Text>
            <Text style={styles.brandMeta}>MESA DE CAMBIO</Text>
          </View>
        </Pressable>
        {!isMobile ? (
          <View style={styles.nav}>
            <Pressable accessibilityRole="link" onPress={() => scrollTo("operaciones")} style={styles.navLink}>
              <Text style={styles.navLinkText}>Operaciones</Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => scrollTo("control")} style={styles.navLink}>
              <Text style={styles.navLinkText}>Control</Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => scrollTo("acceso")} style={styles.navLink}>
              <Text style={styles.navLinkText}>Acceso</Text>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
            onPress={() => goTo("Login")}
            style={({ pressed }) => [styles.headerLogin, pressed && styles.pressed]}
          >
            <Text style={styles.headerLoginText}>Iniciar sesión</Text>
          </Pressable>
          {!isMobile ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Crear cuenta"
              onPress={() => goTo("Register")}
              style={({ pressed }) => [styles.headerRegister, pressed && styles.pressed]}
            >
              <Text style={styles.headerRegisterText}>Crear cuenta</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Persuade / station of the bank teller: make the mechanism visible before the visitor acts. */}
        <View style={styles.heroSection}>
          <View style={styles.heroCopy}>
            <Text accessibilityRole="header" style={styles.heroTitle}>
              Tu casa de cambio, en una sola estación.
            </Text>
            <Text style={styles.heroSubtitle}>
              Cashflow conecta operaciones FX, caja, trabajadores y reportes para que cierres el día con los saldos cuadrados.
            </Text>
            <View style={styles.heroActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isMobile ? "Crear cuenta" : undefined}
                onPress={() => goTo("Register")}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary[800]} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goTo("Login")}
                style={({ pressed }) => [styles.heroSecondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.heroSecondaryButtonText}>Ya tengo una cuenta</Text>
              </Pressable>
            </View>
            <View style={styles.heroNote}>
              <Ionicons name="shield-checkmark-outline" size={17} color={colors.primary[200]} />
              <Text style={styles.heroNoteText}>Seguro · Multimoneda · Auditable</Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.stationPreview,
              {
                opacity: entrance,
                transform: [
                  {
                    translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.previewTopline}>
              <View>
                <Text style={styles.previewKicker}>VISTA DE MUESTRA</Text>
                <Text style={styles.previewTitle}>Estado de la jornada</Text>
              </View>
              <View style={styles.liveDot} />
            </View>
            <View style={styles.previewBalance}>
              <Text style={styles.previewBalanceLabel}>Saldo operativo</Text>
              <Text style={styles.previewBalanceValue}>1,248,520 <Text style={styles.previewCurrency}>CUP</Text></Text>
            </View>
            <View style={styles.previewRows}>
              <PreviewRow label="Compras" value="+ 42,350 CUP" tone="positive" colors={colors} />
              <PreviewRow label="Ventas" value="− 18,200 CUP" tone="neutral" colors={colors} />
              <PreviewRow label="Ganancia FX" value="+ 6,420 CUP" tone="profit" colors={colors} />
            </View>
            <View style={styles.previewFooter}>
              <Ionicons name="time-outline" size={15} color={colors.primary[200]} />
              <Text style={styles.previewFooterText}>Datos ilustrativos para mostrar el flujo.</Text>
            </View>
          </Animated.View>
        </View>

        <View onLayout={registerSection("operaciones")} nativeID="operaciones" style={[styles.section, styles.operationsSection]}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingCopy}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                Todo lo que mueve tu operación, conectado.
              </Text>
              <Text style={styles.sectionSubtitle}>Menos hojas sueltas. Más contexto en cada decisión.</Text>
            </View>
            <Text style={styles.sectionAside}>01 / OPERAR</Text>
          </View>
          <View style={styles.operationsLayout}>
            <View style={styles.capabilityList}>
              {capabilities.map((item, index) => (
                <View key={item.title} style={[styles.capabilityRow, index < capabilities.length - 1 && styles.capabilityDivider]}>
                  <View style={[styles.capabilityIcon, { backgroundColor: colors.primary[50] }]}>
                    <Ionicons name={item.icon} size={22} color={colors.primary[600]} />
                  </View>
                  <View style={styles.capabilityCopy}>
                    <Text style={[styles.capabilityTitle, { color: colors.text.primary }]}>{item.title}</Text>
                    <Text style={[styles.capabilityBody, { color: colors.text.secondary }]}>{item.body}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={[styles.ticket, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.ticketHeader}>
                <Text style={[styles.ticketLabel, { color: colors.text.tertiary }]}>ÚLTIMA OPERACIÓN</Text>
                <Text style={[styles.ticketStatus, { color: colors.success }]}>CONFIRMADA</Text>
              </View>
              <View style={styles.ticketMain}>
                <View>
                  <Text style={[styles.ticketType, { color: colors.text.primary }]}>Venta de USD</Text>
                  <Text style={[styles.ticketDate, { color: colors.text.secondary }]}>Hoy · 10:42 a. m.</Text>
                </View>
                <Text style={[styles.ticketAmount, { color: colors.text.primary }]}>$ 1,200</Text>
              </View>
              <View style={[styles.ticketRule, { backgroundColor: colors.separator }]} />
              <View style={styles.ticketDetails}>
                <Text style={[styles.ticketDetailLabel, { color: colors.text.tertiary }]}>TASA</Text>
                <Text style={[styles.ticketDetailValue, { color: colors.text.primary }]}>420.00 CUP</Text>
                <Text style={[styles.ticketDetailLabel, { color: colors.text.tertiary }]}>GANANCIA</Text>
                <Text style={[styles.ticketDetailValue, { color: colors.financial.profit }]}>+ 3,840 CUP</Text>
              </View>
            </View>
          </View>
        </View>

        <View onLayout={registerSection("control")} nativeID="control" style={[styles.section, styles.controlSection, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingCopy}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                El control empieza cuando ves el día completo.
              </Text>
              <Text style={styles.sectionSubtitle}>Cada saldo tiene un responsable, cada movimiento deja una señal.</Text>
            </View>
            <Text style={styles.sectionAside}>02 / CONTROLAR</Text>
          </View>
          <View style={styles.controlLayout}>
            <View style={styles.controlPanel}>
              <Text style={[styles.controlPanelLabel, { color: colors.primary[600] }]}>CIERRE DEL DÍA</Text>
              <Text style={[styles.controlPanelTitle, { color: colors.text.primary }]}>Una lectura, sin perseguir números.</Text>
              <Text style={[styles.controlPanelBody, { color: colors.text.secondary }]}>El resumen diario reúne caja, gastos, trabajadores y ganancia para que sepas dónde estás antes de terminar.</Text>
              <View style={[styles.controlSignal, { borderColor: colors.border }]}>
                <View style={[styles.signalIcon, { backgroundColor: colors.financial.profitLight }]}>
                  <Ionicons name="checkmark" size={18} color={colors.financial.profit} />
                </View>
                <View>
                  <Text style={[styles.signalTitle, { color: colors.text.primary }]}>Jornada conciliada</Text>
                  <Text style={[styles.signalBody, { color: colors.text.secondary }]}>Todas las monedas visibles</Text>
                </View>
              </View>
            </View>
            <View style={styles.controlPoints}>
              {controlPoints.map((point) => (
                <View key={point} style={styles.controlPoint}>
                  <Ionicons name="checkmark-circle-outline" size={21} color={colors.primary[600]} />
                  <Text style={[styles.controlPointText, { color: colors.text.primary }]}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View onLayout={registerSection("acceso")} nativeID="acceso" style={[styles.section, styles.closingSection]}>
          <View style={styles.closingInner}>
            <View style={styles.closingCopy}>
              <Text accessibilityRole="header" style={styles.closingTitle}>
                Empieza con una operación más clara.
              </Text>
              <Text style={styles.closingSubtitle}>Tu próxima jornada puede tener todos los saldos en su lugar desde el primer movimiento.</Text>
            </View>
            <View style={styles.closingActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => goTo("Register")}
                style={({ pressed }) => [styles.closingButton, pressed && styles.pressed]}
              >
                <Text style={styles.closingButtonText}>Crear cuenta</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary[700]} />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => goTo("Login")} style={styles.closingLogin}>
                <Text style={styles.closingLoginText}>Iniciar sesión</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.footer}>
            <View style={styles.footerBrand}>
              <AppLogo size={25} />
              <Text style={styles.footerBrandText}>Cashflow</Text>
            </View>
            <Text style={styles.footerText}>Gestión para casas de cambio y remesas.</Text>
            <Text style={styles.footerMeta}>© {new Date().getFullYear()} Cashflow</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

function PreviewRow({
  label,
  value,
  tone,
  colors,
}: {
  label: string;
  value: string;
  tone: "positive" | "neutral" | "profit";
  colors: ReturnType<typeof useColors>;
}) {
  const valueColor = tone === "profit" ? colors.financial.profit : tone === "positive" ? colors.financial.income : colors.text.primary;
  return (
    <View style={previewRowStyles.row}>
      <Text style={[previewRowStyles.label, { color: colors.text.secondary }]}>{label}</Text>
      <Text style={[previewRowStyles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const previewRowStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 33 },
  label: { fontFamily: webType.family, fontSize: 13 },
  value: { fontFamily: webType.family, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
});

const createStyles = (
  colors: ReturnType<typeof useColors>,
  isMobile: boolean,
  isStacked: boolean,
) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      minHeight: 72,
      paddingHorizontal: isMobile ? 18 : 40,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
      zIndex: 2,
    },
    brand: { minHeight: webMetrics.touchTarget, flexDirection: "row", alignItems: "center", gap: 10 },
    brandName: { color: colors.text.primary, fontFamily: webType.family, fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
    brandMeta: { color: colors.text.tertiary, fontFamily: webType.family, fontSize: 9, fontWeight: "700", letterSpacing: 1.2, marginTop: 2 },
    nav: { flexDirection: "row", alignItems: "center", gap: 5, marginLeft: "auto", marginRight: 28 },
    navLink: { minHeight: webMetrics.touchTarget, justifyContent: "center", paddingHorizontal: 12 },
    navLinkText: { color: colors.text.secondary, fontFamily: webType.family, fontSize: 13, fontWeight: "600" },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerLogin: { minHeight: webMetrics.touchTarget, justifyContent: "center", paddingHorizontal: 13 },
    headerLoginText: { color: colors.text.primary, fontFamily: webType.family, fontSize: 13, fontWeight: "700" },
    headerRegister: { minHeight: webMetrics.touchTarget, justifyContent: "center", paddingHorizontal: 16, borderRadius: webMetrics.fieldRadius, backgroundColor: colors.primary[600] },
    headerRegisterText: { color: colors.text.inverse, fontFamily: webType.family, fontSize: 13, fontWeight: "700" },
    pressed: { opacity: 0.78 },
    scrollContent: { width: "100%" },
    heroSection: { backgroundColor: colors.primary[800], paddingHorizontal: isMobile ? 22 : 56, paddingTop: isMobile ? 52 : 84, paddingBottom: isMobile ? 56 : 86, flexDirection: isStacked ? "column" : "row", gap: isMobile ? 42 : 64, alignItems: "center" },
    heroCopy: { flex: 1, width: "100%", maxWidth: 680 },
    heroTitle: { color: colors.text.inverse, fontFamily: webType.family, fontSize: isMobile ? 40 : 64, lineHeight: isMobile ? 46 : 70, fontWeight: "800", letterSpacing: -2.4, maxWidth: 680 },
    heroSubtitle: { color: colors.primary[100], fontFamily: webType.family, fontSize: isMobile ? 17 : 19, lineHeight: isMobile ? 27 : 30, maxWidth: 590, marginTop: 24 },
    heroActions: { flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: 10, marginTop: 32 },
    primaryButton: { minHeight: 52, paddingHorizontal: 20, borderRadius: webMetrics.fieldRadius, backgroundColor: colors.primary[100], flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
    primaryButtonText: { color: colors.primary[800], fontFamily: webType.family, fontSize: 14, fontWeight: "800" },
    heroSecondaryButton: { minHeight: 52, paddingHorizontal: 19, borderRadius: webMetrics.fieldRadius, borderWidth: 1, borderColor: colors.primary[400], justifyContent: "center", alignItems: "center" },
    heroSecondaryButtonText: { color: colors.text.inverse, fontFamily: webType.family, fontSize: 14, fontWeight: "700" },
    heroNote: { flexDirection: "row", gap: 7, alignItems: "center", marginTop: 22 },
    heroNoteText: { color: colors.primary[200], fontFamily: webType.family, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: "700" },
    stationPreview: { width: isMobile ? "100%" : 390, borderRadius: 16, backgroundColor: colors.card, padding: 22, boxShadow: "0 16px 28px rgba(0, 0, 0, 0.18)" },
    previewTopline: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    previewKicker: { color: colors.primary[600], fontFamily: webType.family, fontSize: 10, letterSpacing: 1.25, fontWeight: "800" },
    previewTitle: { color: colors.text.primary, fontFamily: webType.family, fontSize: 18, fontWeight: "800", marginTop: 5 },
    liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.success, marginTop: 5 },
    previewBalance: { borderBottomWidth: 1, borderBottomColor: colors.separator, paddingVertical: 24 },
    previewBalanceLabel: { color: colors.text.secondary, fontFamily: webType.family, fontSize: 12 },
    previewBalanceValue: { color: colors.text.primary, fontFamily: webType.family, fontSize: 33, lineHeight: 40, fontWeight: "800", letterSpacing: -1, fontVariant: ["tabular-nums"], marginTop: 5 },
    previewCurrency: { color: colors.text.tertiary, fontSize: 14, letterSpacing: 0, fontWeight: "700" },
    previewRows: { paddingVertical: 13, gap: 3 },
    previewFooter: { flexDirection: "row", gap: 7, alignItems: "center", borderTopWidth: 1, borderTopColor: colors.separator, paddingTop: 15 },
    previewFooterText: { color: colors.text.tertiary, fontFamily: webType.family, fontSize: 11 },
    section: { paddingHorizontal: isMobile ? 22 : 56, paddingVertical: isMobile ? 58 : 100 },
    operationsSection: { backgroundColor: colors.background },
    sectionHeadingRow: { flexDirection: isStacked ? "column" : "row", justifyContent: "space-between", alignItems: isStacked ? "flex-start" : "flex-end", gap: 20, maxWidth: webMetrics.contentMaxWidth, width: "100%", alignSelf: "center" },
    sectionHeadingCopy: { maxWidth: 680 },
    sectionTitle: { color: colors.text.primary, fontFamily: webType.family, fontSize: isMobile ? 31 : 45, lineHeight: isMobile ? 38 : 52, fontWeight: "800", letterSpacing: -1.3 },
    sectionSubtitle: { color: colors.text.secondary, fontFamily: webType.family, fontSize: 16, lineHeight: 25, marginTop: 16, maxWidth: 520 },
    sectionAside: { color: colors.primary[600], fontFamily: webType.family, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
    operationsLayout: { flexDirection: isStacked ? "column" : "row", gap: isMobile ? 34 : 76, maxWidth: webMetrics.contentMaxWidth, width: "100%", alignSelf: "center", marginTop: isMobile ? 42 : 68 },
    capabilityList: { flex: 1 },
    capabilityRow: { flexDirection: "row", alignItems: "flex-start", gap: 17, paddingVertical: 24 },
    capabilityDivider: { borderBottomWidth: 1, borderBottomColor: colors.separator },
    capabilityIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    capabilityCopy: { flex: 1, paddingTop: 2 },
    capabilityTitle: { fontFamily: webType.family, fontSize: 17, fontWeight: "800" },
    capabilityBody: { fontFamily: webType.family, fontSize: 14, lineHeight: 22, marginTop: 5, maxWidth: 420 },
    ticket: { flex: 0.9, maxWidth: 470, borderWidth: 1, borderRadius: 14, padding: 24, boxShadow: "0 8px 20px rgba(0, 30, 56, 0.08)" },
    ticketHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    ticketLabel: { fontFamily: webType.family, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
    ticketStatus: { fontFamily: webType.family, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
    ticketMain: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32 },
    ticketType: { fontFamily: webType.family, fontSize: 19, fontWeight: "800" },
    ticketDate: { fontFamily: webType.family, fontSize: 12, marginTop: 5 },
    ticketAmount: { fontFamily: webType.family, fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"] },
    ticketRule: { height: 1, marginVertical: 24 },
    ticketDetails: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", rowGap: 8 },
    ticketDetailLabel: { fontFamily: webType.family, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
    ticketDetailValue: { fontFamily: webType.family, fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
    controlSection: { width: "100%" },
    controlLayout: { flexDirection: isStacked ? "column" : "row", gap: isMobile ? 42 : 88, maxWidth: webMetrics.contentMaxWidth, width: "100%", alignSelf: "center", marginTop: isMobile ? 42 : 68 },
    controlPanel: { flex: 1, maxWidth: 580 },
    controlPanelLabel: { fontFamily: webType.family, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
    controlPanelTitle: { fontFamily: webType.family, fontSize: isMobile ? 26 : 32, lineHeight: isMobile ? 34 : 41, fontWeight: "800", letterSpacing: -0.7, marginTop: 14 },
    controlPanelBody: { fontFamily: webType.family, fontSize: 15, lineHeight: 24, marginTop: 16, maxWidth: 500 },
    controlSignal: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 28, maxWidth: 340 },
    signalIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
    signalTitle: { fontFamily: webType.family, fontSize: 13, fontWeight: "800" },
    signalBody: { fontFamily: webType.family, fontSize: 12, marginTop: 3 },
    controlPoints: { flex: 1, justifyContent: "center", gap: 28 },
    controlPoint: { flexDirection: "row", alignItems: "center", gap: 13, minHeight: webMetrics.touchTarget },
    controlPointText: { fontFamily: webType.family, fontSize: 17, lineHeight: 24, fontWeight: "700", maxWidth: 420 },
    closingSection: { backgroundColor: colors.primary[800], paddingBottom: 24 },
    closingInner: { maxWidth: webMetrics.contentMaxWidth, width: "100%", alignSelf: "center", flexDirection: isStacked ? "column" : "row", alignItems: isStacked ? "flex-start" : "center", justifyContent: "space-between", gap: 32, paddingVertical: isMobile ? 12 : 22 },
    closingCopy: { maxWidth: 650 },
    closingTitle: { color: colors.text.inverse, fontFamily: webType.family, fontSize: isMobile ? 32 : 44, lineHeight: isMobile ? 39 : 52, fontWeight: "800", letterSpacing: -1.2 },
    closingSubtitle: { color: colors.primary[100], fontFamily: webType.family, fontSize: 16, lineHeight: 25, marginTop: 15, maxWidth: 560 },
    closingActions: { gap: 10, minWidth: isMobile ? "100%" : 190 },
    closingButton: { minHeight: 52, borderRadius: webMetrics.fieldRadius, paddingHorizontal: 19, backgroundColor: colors.primary[100], flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 11 },
    closingButtonText: { color: colors.primary[800], fontFamily: webType.family, fontSize: 14, fontWeight: "800" },
    closingLogin: { minHeight: webMetrics.touchTarget, justifyContent: "center", alignItems: "center" },
    closingLoginText: { color: colors.text.inverse, fontFamily: webType.family, fontSize: 13, fontWeight: "700" },
    footer: { maxWidth: webMetrics.contentMaxWidth, width: "100%", alignSelf: "center", borderTopWidth: 1, borderTopColor: colors.primary[600], marginTop: 54, paddingTop: 22, flexDirection: isStacked ? "column" : "row", alignItems: isStacked ? "flex-start" : "center", gap: 12 },
    footerBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
    footerBrandText: { color: colors.text.inverse, fontFamily: webType.family, fontSize: 14, fontWeight: "800" },
    footerText: { color: colors.primary[200], fontFamily: webType.family, fontSize: 12, flex: 1 },
    footerMeta: { color: colors.primary[300], fontFamily: webType.family, fontSize: 11 },
  });

export default WelcomeScreen;
