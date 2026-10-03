import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0284c7',
    borderBottomStyle: 'solid',
    paddingBottom: 14,
    marginBottom: 16,
  },
  companyInfo: {
    width: '55%',
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  companySubtitle: {
    fontSize: 8,
    color: '#0284c7',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  companyDetail: {
    fontSize: 8,
    color: '#64748b',
    lineHeight: 1.3,
  },
  reportMetaContainer: {
    width: '40%',
    alignItems: 'flex-end',
  },
  titleBadge: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 8.5,
    color: '#64748b',
    marginRight: 4,
  },
  metaValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },

  // Sections
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
    marginBottom: 6,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  
  // Grid / Data Boxes
  twoColumnGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  colHalf: {
    width: '48.5%',
  },
  dataBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 8,
    minHeight: 70,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '32%',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
  },
  value: {
    width: '68%',
    fontSize: 8.5,
    color: '#0f172a',
    lineHeight: 1.2,
  },

  // Text Content Blocks
  contentBlock: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 8,
    minHeight: 45,
  },
  bodyText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.45,
  },

  // Total / Financial Callout
  totalCalloutContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginBottom: 14,
  },
  totalBox: {
    width: '50%',
    backgroundColor: '#f0f9ff',
    borderWidth: 1.5,
    borderColor: '#0284c7',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
  },

  // Signature Block
  signatureSection: {
    marginTop: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBoxContainer: {
    width: '45%',
    alignItems: 'center',
  },
  signatureImage: {
    width: 140,
    height: 45,
    objectFit: 'contain',
    marginBottom: 4,
  },
  signatureLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    borderTopStyle: 'solid',
    marginTop: 4,
    paddingTop: 3,
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },

  // Legal Notice
  legalNoticeBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 4,
    padding: 6,
    marginBottom: 16,
  },
  legalNoticeText: {
    fontSize: 7.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.3,
  },

  // Footer fixed
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7.5,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 7.5,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Bold',
  },
});
