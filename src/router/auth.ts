import type { RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/types/user.types'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/authenticated/Dashboard.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.ACCOUNTING, UserRole.CASHIER_DBP, UserRole.CASHIER_LBP],
    },
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('@/views/authenticated/employees/Index.vue'),
    meta: { layout: 'auth', requiresAuth: true, roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
  },
  {
    path: '/offices',
    name: 'Offices',
    component: () => import('@/views/authenticated/offices/Index.vue'),
    meta: { layout: 'auth', requiresAuth: true, roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
  },
  {
    path: '/banks',
    name: 'Banks',
    component: () => import('@/views/authenticated/banks/Index.vue'),
    meta: { layout: 'auth', requiresAuth: true, roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
  },
  {
    path: '/payroll/periods',
    name: 'PayrollPeriods',
    component: () => import('@/views/authenticated/payroll/periods/Index.vue'),
    meta: { layout: 'auth', requiresAuth: true, roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
  },
  {
    path: '/payroll/preparation',
    name: 'PayrollPreparation',
    component: () => import('@/views/authenticated/payroll/preparation/Index.vue'),
    meta: { layout: 'auth', requiresAuth: true, roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
  },
  {
    path: '/payroll/preparation/:batch_code/:batch_id/employee-payroll',
    name: 'EmployeePayroll',
    component: () => import('@/views/authenticated/payroll/preparation/employee-payroll/Index.vue'),
    meta: { layout: 'auth', requiresAuth: true, roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
  },
  {
    path: '/payroll/ada',
    name: 'PayrollAda',
    component: () => import('@/views/authenticated/payroll/ada/Index.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.CASHIER_DBP, UserRole.CASHIER_LBP],
    },
  },
  {
    path: '/payroll/ada/:ada_number/:ada_id/:bank_account_id/batches',
    name: 'PayrollAdaBatches',
    component: () => import('@/views/authenticated/payroll/ada/batches/Index.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.ACCOUNTING, UserRole.CASHIER_DBP, UserRole.CASHIER_LBP],
    },
  },

  {
    path: '/audit-logs',
    name: 'AuditLogs',
    component: () => import('@/views/authenticated/audit-logs/Index.vue'),
    meta: { layout: 'auth', requiresAuth: true, roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
  },
  {
    path: '/settings',
    component: () => import('@/views/authenticated/settings/Index.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.ACCOUNTING, UserRole.CASHIER_DBP, UserRole.CASHIER_LBP],
    },
    redirect: '/settings/profile',
    children: [
      {
        path: 'profile',
        name: 'SettingsProfile',
        component: () => import('@/views/authenticated/settings/Profile.vue'),
      },
      {
        path: 'account',
        name: 'SettingsAccount',
        component: () => import('@/views/authenticated/settings/Account.vue'),
      },
      {
        path: 'appearance',
        name: 'SettingsAppearance',
        component: () => import('@/views/authenticated/settings/Appearance.vue'),
      },
    ],
  },
]
