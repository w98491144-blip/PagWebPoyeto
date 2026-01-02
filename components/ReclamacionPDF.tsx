"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Reclamacion } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1f2933"
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 10
  },
  section: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6
  },
  row: {
    marginBottom: 4
  },
  label: {
    fontSize: 10,
    color: "#52606d"
  },
  value: {
    fontSize: 11
  },
  divider: {
    height: 1,
    backgroundColor: "#d9e2ec",
    marginVertical: 8
  }
});

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const ReclamacionPDF = ({ claim }: { claim: Reclamacion }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Libro de Reclamaciones</Text>
        <Text style={styles.subtitle}>Constancia de Hoja de Reclamacion</Text>
        <Text style={styles.row}>Numero de hoja: {claim.numero_hoja}</Text>
        <Text style={styles.row}>Fecha de registro: {formatDateTime(claim.fecha_registro)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del proveedor</Text>
        <Text style={styles.row}>Razon social: {claim.proveedor_nombre_razon_social}</Text>
        <Text style={styles.row}>RUC: {claim.proveedor_ruc}</Text>
        <Text style={styles.row}>Domicilio: {claim.proveedor_domicilio_establecimiento}</Text>
        <Text style={styles.row}>
          Codigo establecimiento: {claim.proveedor_codigo_identificacion_establecimiento || "-"}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Identificacion del consumidor</Text>
        <Text style={styles.row}>Nombre completo: {claim.consumidor_nombre_completo}</Text>
        <Text style={styles.row}>Domicilio: {claim.consumidor_domicilio}</Text>
        <Text style={styles.row}>
          Documento: {claim.consumidor_tipo_doc} {claim.consumidor_num_doc}
        </Text>
        <Text style={styles.row}>Telefono: {claim.consumidor_telefono}</Text>
        <Text style={styles.row}>Email: {claim.consumidor_email}</Text>
        <Text style={styles.row}>Menor de edad: {claim.consumidor_es_menor ? "Si" : "No"}</Text>
        <Text style={styles.row}>
          Padre/madre o apoderado: {claim.consumidor_padre_madre || "-"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Identificacion del bien contratado</Text>
        <Text style={styles.row}>Tipo: {claim.bien_tipo}</Text>
        <Text style={styles.row}>Monto reclamado: S/ {Number(claim.bien_monto_reclamado).toFixed(2)}</Text>
        <Text style={styles.row}>Descripcion: {claim.bien_descripcion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Detalle y pedido</Text>
        <Text style={styles.row}>Tipo de registro: {claim.tipo_registro}</Text>
        <Text style={styles.row}>Detalle: {claim.detalle_reclamacion}</Text>
        <Text style={styles.row}>Pedido del consumidor: {claim.pedido_consumidor}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Observaciones y acciones del proveedor</Text>
        <Text style={styles.row}>Acciones: {claim.acciones_proveedor || "-"}</Text>
        <Text style={styles.row}>Fecha acciones: {formatDate(claim.acciones_fecha)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confirmaciones</Text>
        <Text style={styles.row}>
          Consumidor: {claim.confirmacion_consumidor ? "Confirmado" : "Pendiente"}
        </Text>
        <Text style={styles.row}>
          Fecha confirmacion consumidor: {formatDateTime(claim.confirmacion_consumidor_fecha)}
        </Text>
        <Text style={styles.row}>
          Proveedor: {claim.confirmacion_proveedor ? "Confirmado" : "Pendiente"}
        </Text>
        <Text style={styles.row}>
          Fecha confirmacion proveedor: {formatDateTime(claim.confirmacion_proveedor_fecha)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gestion y respuesta</Text>
        <Text style={styles.row}>Estado: {claim.estado}</Text>
        <Text style={styles.row}>Respuesta: {claim.respuesta_proveedor || "-"}</Text>
        <Text style={styles.row}>Fecha respuesta: {formatDateTime(claim.fecha_respuesta)}</Text>
        <Text style={styles.row}>
          Fecha comunicacion respuesta: {formatDate(claim.fecha_comunicacion_respuesta)}
        </Text>
        <Text style={styles.row}>Prorroga hasta: {formatDate(claim.prorroga_hasta)}</Text>
        <Text style={styles.row}>Motivo prorroga: {claim.prorroga_motivo || "-"}</Text>
        <Text style={styles.row}>
          Fecha comunicacion prorroga: {formatDate(claim.prorroga_fecha_comunicacion)}
        </Text>
      </View>
    </Page>
  </Document>
);

export default ReclamacionPDF;
