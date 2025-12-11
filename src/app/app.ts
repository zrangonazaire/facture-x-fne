import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';

interface StatCard {
  label: string;
  value: number;
  suffix?: string;
  delta?: string;
  tone?: 'positive' | 'warning' | 'neutral';
}

interface Invoice {
  id: string;
  client: string;
  status: 'Brouillon' | 'Envoyée' | 'Payée' | 'En retard' | 'Partielle';
  due: string;
  total: number;
  currency: string;
  tags: string[];
  type: 'Vente' | 'Proforma' | 'Bordereau';
}

interface Client {
  name: string;
  contact: string;
  openBalance: number;
  currency: string;
  lastInvoice: string;
  recurrence?: string;
}

interface PaymentEvent {
  type: 'Encaissement' | 'Dépense';
  ref: string;
  amount: number;
  currency: string;
  date: string;
  account: string;
}

interface Reminder {
  title: string;
  due: string;
  amount: number;
  currency: string;
  client: string;
  status: 'A relancer' | 'Planifiée' | 'Clôturée';
}

interface InvoiceFormLine {
  label: string;
  qty: number;
  price: number;
  tva: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly brand = 'Facture X';
  readonly currentYear = new Date().getFullYear();

  currentPage: 'factures' | 'clients' | 'devis' | 'parametres' | 'creation-facture' | 'nomenclature' = 'factures';
  invoiceTab: 'emis' | 'recus' = 'emis';
  selectedPeriod = '14j';
  selectedType = 'tous';

  readonly periods = [
    { value: '7j', label: '7 derniers jours' },
    { value: '14j', label: '14 derniers jours' },
    { value: '30j', label: '30 derniers jours' },
    { value: 'all', label: 'Toutes périodes' },
  ];

  readonly types = [
    { value: 'tous', label: 'Tous les types' },
    { value: 'Vente', label: 'Vente' },
    { value: 'Proforma', label: 'Proforma' },
    { value: 'Bordereau', label: "Bordereau d'achat" },
  ];

  readonly statCards: StatCard[] = [
    { label: 'CA du mois', value: 48200, suffix: '€', delta: '+12% vs mois préc.', tone: 'positive' },
    { label: 'Impayés à suivre', value: 12450, suffix: '€', delta: '8 factures', tone: 'warning' },
    { label: 'Récurrent mensuel', value: 16320, suffix: '€', delta: '12 contrats actifs', tone: 'neutral' },
    { label: 'Devis en attente', value: 5, suffix: ' envoi(s)', delta: '2 relances auto prévues', tone: 'neutral' },
  ];

  readonly issuedInvoices: Invoice[] = [
    { id: 'FAC-2025-001', client: 'Atelier Horizon', status: 'En retard', due: '2025-12-05', total: 2220, currency: 'EUR', tags: ['Design', 'Maintenance'], type: 'Vente' },
    { id: 'FAC-2025-002', client: 'Maison Camélia', status: 'Envoyée', due: '2025-12-28', total: 1280, currency: 'EUR', tags: ['Coaching'], type: 'Proforma' },
    { id: 'FAC-2025-003', client: 'Collectif Baryton', status: 'Payée', due: '2025-12-02', total: 3640, currency: 'EUR', tags: ['Refonte', 'UX'], type: 'Vente' },
    { id: 'FAC-2025-004', client: 'Les Frangins', status: 'Partielle', due: '2025-12-20', total: 980, currency: 'EUR', tags: ['Maintenance'], type: 'Bordereau' },
    { id: 'FAC-2025-005', client: 'Studio Ebène', status: 'Brouillon', due: '2026-01-04', total: 1840, currency: 'EUR', tags: ['Conseil'], type: 'Vente' },
  ];

  readonly receivedInvoices: Invoice[] = [
    { id: 'REC-2025-201', client: 'Fourniture CI', status: 'Payée', due: '2025-12-03', total: 540, currency: 'EUR', tags: ['Fournisseur'], type: 'Vente' },
    { id: 'REC-2025-202', client: 'Compta & Co', status: 'Envoyée', due: '2025-12-18', total: 860, currency: 'EUR', tags: ['Services'], type: 'Proforma' },
    { id: 'REC-2025-203', client: 'Agence Noka', status: 'En retard', due: '2025-12-10', total: 1320, currency: 'EUR', tags: ['Sous-traitance'], type: 'Vente' },
  ];

  readonly clients: Client[] = [
    { name: 'Atelier Horizon', contact: 'lucie@horizon.fr', openBalance: 2220, currency: 'EUR', lastInvoice: '2025-12-05', recurrence: 'Mensuel' },
    { name: 'Maison Camélia', contact: 'contact@camelia.co', openBalance: 1280, currency: 'EUR', lastInvoice: '2025-12-28' },
    { name: 'Collectif Baryton', contact: 'jean@baryton.io', openBalance: 0, currency: 'EUR', lastInvoice: '2025-12-02', recurrence: 'Trimestriel' },
    { name: 'Studio Ebène', contact: 'hello@ebene.studio', openBalance: 1840, currency: 'EUR', lastInvoice: '2026-01-04' },
  ];

  readonly payments: PaymentEvent[] = [
    { type: 'Encaissement', ref: 'Virement ACME', amount: 1320, currency: 'EUR', date: '2025-12-10T10:00:00Z', account: 'CA Pro' },
    { type: 'Encaissement', ref: 'Stripe #7841', amount: 480, currency: 'EUR', date: '2025-12-09T17:30:00Z', account: 'Stripe' },
    { type: 'Dépense', ref: 'Acompte sous-traitant', amount: -620, currency: 'EUR', date: '2025-12-09T09:15:00Z', account: 'CA Pro' },
    { type: 'Encaissement', ref: 'Paiement CB', amount: 720, currency: 'EUR', date: '2025-12-08T11:20:00Z', account: 'Terminal' },
  ];

  readonly reminders: Reminder[] = [
    { title: 'Relance J+3 - FAC-2025-001', due: '2025-12-08', amount: 2220, currency: 'EUR', client: 'Atelier Horizon', status: 'A relancer' },
    { title: 'Relance J+7 - FAC-2025-004', due: '2025-12-27', amount: 980, currency: 'EUR', client: 'Les Frangins', status: 'Planifiée' },
    { title: 'Avoir partiel - FAC-2025-003', due: '2025-12-12', amount: -360, currency: 'EUR', client: 'Collectif Baryton', status: 'Clôturée' },
  ];

  readonly quickInvoice = {
    number: 'FAC-2025-006',
    client: 'Nouveau client',
    lines: [
      { label: 'Mission conseil', qty: 1, price: 1200 },
      { label: 'Workshop équipe', qty: 1, price: 640 },
    ],
    taxRate: 0.2,
    dueInDays: 30,
  };

  readonly creationLines: InvoiceFormLine[] = [
    { label: 'Prestation design', qty: 1, price: 1200, tva: 20 },
    { label: 'Maintenance applicative', qty: 1, price: 380, tva: 20 },
  ];

  readonly nomenclatures = [
    { code: 'ART-001', libelle: 'Service design', categorie: 'Services', unite: 'Unité', tva: 20, prix: 1200 },
    { code: 'ART-002', libelle: 'Maintenance', categorie: 'Services', unite: 'Mois', tva: 20, prix: 320 },
    { code: 'ART-003', libelle: 'Formation équipe', categorie: 'Formation', unite: 'Session', tva: 20, prix: 640 },
  ];

  setPage(page: App['currentPage']): void {
    this.currentPage = page;
  }

  isPage(page: App['currentPage']): boolean {
    return this.currentPage === page;
  }

  setInvoiceTab(tab: 'emis' | 'recus'): void {
    this.invoiceTab = tab;
  }

  setPeriod(value: string): void {
    this.selectedPeriod = value;
  }

  setType(value: string): void {
    this.selectedType = value;
  }

  getFilteredInvoices(): Invoice[] {
    const list = this.invoiceTab === 'emis' ? this.issuedInvoices : this.receivedInvoices;
    if (this.selectedType === 'tous') return list;
    return list.filter((inv) => inv.type === this.selectedType);
  }

  getCreationSubtotal(): number {
    return this.creationLines.reduce((sum, line) => sum + line.qty * line.price, 0);
  }

  getCreationTax(): number {
    return this.creationLines.reduce((sum, line) => sum + line.qty * line.price * (line.tva / 100), 0);
  }

  getCreationTotal(): number {
    return this.getCreationSubtotal() + this.getCreationTax();
  }

  getSubtotal(): number {
    return this.quickInvoice.lines.reduce((sum, line) => sum + line.qty * line.price, 0);
  }

  getTax(): number {
    return this.getSubtotal() * this.quickInvoice.taxRate;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }
}
