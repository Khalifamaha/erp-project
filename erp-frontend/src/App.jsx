import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Placeholder from '@/pages/Placeholder'
import Settings from '@/pages/Settings'
import Clients from '@/pages/commercial/Clients'
import ClientForm from '@/pages/commercial/ClientForm'
import ClientDetail from '@/pages/commercial/ClientDetail'
import Commandes from '@/pages/commercial/Commandes'
import CommandeForm from '@/pages/commercial/CommandeForm'
import CommandeDetail from '@/pages/commercial/CommandeDetail'
import Camions from '@/pages/commercial/Camions'
import CamionForm from '@/pages/commercial/CamionForm'
import Expeditions from '@/pages/commercial/Expeditions'
import ExpeditionForm from '@/pages/commercial/ExpeditionForm'
import Employees from '@/pages/hr/Employees'
import EmployeeForm from '@/pages/hr/EmployeeForm'
import EmployeeDetail from '@/pages/hr/EmployeeDetail'
import Attendance from '@/pages/hr/Attendance'
import Payroll from '@/pages/hr/Payroll'
import PayrollGeneration from '@/pages/hr/PayrollGeneration'
import Leaves from '@/pages/hr/Leaves'
import Products from '@/pages/inventory/Products'
import ProductForm from '@/pages/inventory/ProductForm'
import ProductDetail from '@/pages/inventory/ProductDetail'
import Categories from '@/pages/inventory/Categories'
import Stock from '@/pages/inventory/Stock'
import StockMovements from '@/pages/inventory/StockMovements'
import StockAdjustment from '@/pages/inventory/StockAdjustment'
import Suppliers from '@/pages/procurement/Suppliers'
import SupplierForm from '@/pages/procurement/SupplierForm'
import SupplierDetail from '@/pages/procurement/SupplierDetail'
import PurchaseOrders from '@/pages/procurement/PurchaseOrders'
import PurchaseOrderForm from '@/pages/procurement/PurchaseOrderForm'
import PurchaseOrderDetail from '@/pages/procurement/PurchaseOrderDetail'
import Receipts from '@/pages/procurement/Receipts'
import ReceiptForm from '@/pages/procurement/ReceiptForm'
import Invoices from '@/pages/procurement/Invoices'
import Machines from '@/pages/production/Machines'
import MachineForm from '@/pages/production/MachineForm'
import Gammes from '@/pages/production/Gammes'
import GammeForm from '@/pages/production/GammeForm'
import ChaineForm from '@/pages/production/ChaineForm'
import Orders from '@/pages/production/Orders'
import OrderForm from '@/pages/production/OrderForm'
import OrderDetail from '@/pages/production/OrderDetail'
import ProductionLine from '@/pages/production/ProductionLine'
import Controls from '@/pages/quality/Controls'
import ControlForm from '@/pages/quality/ControlForm'
import Criteria from '@/pages/quality/Criteria'
import NCReports from '@/pages/quality/NCReports'
import NCForm from '@/pages/quality/NCForm'
import NCWorkflow from '@/pages/quality/NCWorkflow'
import GanttPage from '@/pages/planning/Gantt'
import Planning from '@/pages/planning/Planning'
import MachineSchedule from '@/pages/planning/MachineSchedule'
import Conflicts from '@/pages/planning/Conflicts'
import FiscalYear from '@/pages/comptabilite/FiscalYear'
import AccountChart from '@/pages/comptabilite/AccountChart'
import Journal from '@/pages/comptabilite/Journal'
import JournalEntryForm from '@/pages/comptabilite/JournalEntryForm'
import TrialBalance from '@/pages/comptabilite/TrialBalance'
import BalanceSheet from '@/pages/comptabilite/BalanceSheet'
import ComptaInvoices from '@/pages/comptabilite/Invoices'
import Breakdowns from '@/pages/gmo/Breakdowns'
import Interventions from '@/pages/gmo/Interventions'
import PreventiveMaintenance from '@/pages/gmo/PreventiveMaintenance'
import MTBFMTTR from '@/pages/gmo/MTBFMTTR'
import Login from '@/pages/auth/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/new" element={<ClientForm />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/clients/:id/edit" element={<ClientForm />} />
                <Route path="/commandes" element={<Commandes />} />
                <Route path="/commandes/new" element={<CommandeForm />} />
                <Route path="/commandes/:id" element={<CommandeDetail />} />
                <Route path="/expeditions" element={<Expeditions />} />
                <Route path="/expeditions/new" element={<ExpeditionForm />} />
                <Route path="/camions" element={<Camions />} />
                <Route path="/camions/new" element={<CamionForm />} />
                <Route path="/camions/:id/edit" element={<CamionForm />} />
                <Route path="/employes" element={<Employees />} />
                <Route path="/employes/new" element={<EmployeeForm />} />
                <Route path="/employes/:id" element={<EmployeeDetail />} />
                <Route path="/employes/:id/edit" element={<EmployeeForm />} />
                <Route path="/pointages" element={<Attendance />} />
                <Route path="/paie" element={<Payroll />} />
                <Route path="/paie/generer" element={<PayrollGeneration />} />
                <Route path="/conges" element={<Leaves />} />
                <Route path="/produits" element={<Products />} />
                <Route path="/produits/new" element={<ProductForm />} />
                <Route path="/produits/:id" element={<ProductDetail />} />
                <Route path="/produits/:id/edit" element={<ProductForm />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/stock" element={<Stock />} />
                <Route path="/mouvements" element={<StockMovements />} />
                <Route path="/ajustement" element={<StockAdjustment />} />
                <Route path="/fournisseurs" element={<Suppliers />} />
                <Route path="/fournisseurs/new" element={<SupplierForm />} />
                <Route path="/fournisseurs/:id/edit" element={<SupplierForm />} />
                <Route path="/fournisseurs/:id" element={<SupplierDetail />} />
                <Route path="/achats" element={<PurchaseOrders />} />
                <Route path="/achats/new" element={<PurchaseOrderForm />} />
                <Route path="/achats/:id" element={<PurchaseOrderDetail />} />
                <Route path="/receptions" element={<Receipts />} />
                <Route path="/receptions/new" element={<ReceiptForm />} />
                <Route path="/factures-achat" element={<Invoices />} />
                <Route path="/machines" element={<Machines />} />
                <Route path="/machines/new" element={<MachineForm />} />
                <Route path="/machines/:id/edit" element={<MachineForm />} />
                <Route path="/gammes" element={<Gammes />} />
                <Route path="/gammes/new" element={<GammeForm />} />
                <Route path="/chaines/new" element={<ChaineForm />} />
                <Route path="/of" element={<Orders />} />
                <Route path="/of/new" element={<OrderForm />} />
                <Route path="/of/:id" element={<OrderDetail />} />
                <Route path="/production" element={<ProductionLine />} />
                <Route path="/controles" element={<Controls />} />
                <Route path="/controles/new" element={<ControlForm />} />
                <Route path="/criteres" element={<Criteria />} />
                <Route path="/nc" element={<NCReports />} />
                <Route path="/nc/new" element={<NCForm />} />
                <Route path="/nc/:id" element={<NCWorkflow />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/gantt" element={<GanttPage />} />
                <Route path="/charge" element={<MachineSchedule />} />
                <Route path="/conflits" element={<Conflicts />} />
                <Route path="/exercices" element={<FiscalYear />} />
                <Route path="/plan-comptable" element={<AccountChart />} />
                <Route path="/ecritures" element={<Journal />} />
                <Route path="/ecritures/new" element={<JournalEntryForm />} />
                <Route path="/balance" element={<TrialBalance />} />
                <Route path="/bilan" element={<BalanceSheet />} />
                <Route path="/factures-vente" element={<ComptaInvoices />} />
                <Route path="/pannes" element={<Breakdowns />} />
                <Route path="/interventions" element={<Interventions />} />
                <Route path="/maintenance-preventive" element={<PreventiveMaintenance />} />
                <Route path="/mtbf-mttr" element={<MTBFMTTR />} />
                <Route path="/parametres" element={<Settings />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}