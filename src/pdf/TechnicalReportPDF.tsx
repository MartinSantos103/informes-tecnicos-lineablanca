import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { Company, TechnicalReport } from '../types';
import { styles } from './PDFStyles';
import { formatCurrency, formatDateSpanish } from '../utils/formatters';

interface TechnicalReportPDFProps {
  report: TechnicalReport;
  company: Company;
}

export const TechnicalReportPDF: React.FC<TechnicalReportPDFProps> = ({ report, company }) => {
  return (
    <Document title={`Informe_Tecnico_${report.report_number}`} author={company.name}>
      <Page size="A4" style={styles.page}>
        {/* HEADER CORPORATIVO */}
        <View style={styles.headerContainer}>
          <View style={styles.companyInfo}>
            {company.logo_url ? (
              <Image src={company.logo_url} style={{ width: 120, height: 40, marginBottom: 4, objectFit: 'contain' }} />
            ) : null}
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companySubtitle}>Servicio Técnico de Línea Blanca</Text>
            <Text style={styles.companySubtitle}>Refrigeración Comercial</Text>
            <Text style={styles.companyDetail}>{company.address}</Text>
            <Text style={styles.companyDetail}>Tel: {company.phone} | Email: {company.email}</Text>
            {company.website ? <Text style={styles.companyDetail}>Web: {company.website}</Text> : null}
          </View>

          <View style={styles.reportMetaContainer}>
            <Text style={styles.titleBadge}>Informe Técnico</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>N° Estimación:</Text>
              <Text style={styles.metaValue}>#{report.report_number}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Fecha Emisión:</Text>
              <Text style={styles.metaValue}>{formatDateSpanish(report.date)}</Text>
            </View>
          </View>
        </View>

        {/* GRILLA DATOS DEL CLIENTE Y DEL EQUIPO */}
        <View style={styles.section}>
          <View style={styles.twoColumnGrid}>
            {/* Columna Cliente */}
            <View style={styles.colHalf}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Información del Cliente</Text>
              </View>
              <View style={styles.dataBox}>
                <View style={styles.dataRow}>
                  <Text style={styles.label}>Cliente:</Text>
                  <Text style={styles.value}>{report.client_name}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.label}>Dirección:</Text>
                  <Text style={styles.value}>{report.address}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.label}>Teléfono:</Text>
                  <Text style={styles.value}>{report.phone}</Text>
                </View>
                {report.email ? (
                  <View style={styles.dataRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{report.email}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Columna Equipo */}
            <View style={styles.colHalf}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Datos del Equipo</Text>
              </View>
              <View style={styles.dataBox}>
                <View style={styles.dataRow}>
                  <Text style={styles.label}>Equipo:</Text>
                  <Text style={styles.value}>{report.equipment}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.label}>Marca:</Text>
                  <Text style={styles.value}>{report.brand}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.label}>Modelo:</Text>
                  <Text style={styles.value}>{report.model}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.label}>N° de Serie:</Text>
                  <Text style={styles.value}>{report.serial_number || '-'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* DIAGNÓSTICO TÉCNICO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Diagnóstico Técnico</Text>
          </View>
          <View style={styles.contentBlock}>
            <Text style={styles.bodyText}>{report.diagnosis}</Text>
          </View>
        </View>

        {/* CAUSA DE LA FALLA (SECCIÓN OBLIGATORIA) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Causa</Text>
          </View>
          <View style={styles.contentBlock}>
            <Text style={styles.bodyText}>{report.cause}</Text>
          </View>
        </View>

        {/* TRABAJO RECOMENDADO / A REALIZAR */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trabajo Recomendado / Repuestos</Text>
          </View>
          <View style={styles.contentBlock}>
            <Text style={styles.bodyText}>{report.work_description}</Text>
          </View>
        </View>

        {/* COSTO ESTIMADO DESTACADO */}
        <View style={styles.totalCalloutContainer}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Presupuesto Estimado:</Text>
            <Text style={styles.totalValue}>{formatCurrency(report.estimated_cost)}</Text>
          </View>
        </View>

        {/* NOTA LEGAL */}
        <View style={styles.legalNoticeBox}>
          <Text style={styles.legalNoticeText}>
            {company.legal_notice || 'Esta estimación no constituye una factura ni contrato de prestación de servicios.'}
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {company.name} • {company.phone} • {company.email}
          </Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
