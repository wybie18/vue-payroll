// ─── Action types ─────────────────────────────────────────────────────────────

/**
 * All supported action types across all banks.
 * Adding a new bank's unique action requires adding a new type here,
 * then handling it in useAdaBankActions.ts.
 */
export type AdaBankActionType = 'export-txt' | 'export-csv' | 'print-prooflist' | 'print-ada'

export type AdaBankActionIcon = 'Download' | 'Printer'

export interface AdaBankAction {
  type: AdaBankActionType
  label: string
  icon: AdaBankActionIcon
}

/**
 * A group of related actions. Groups are visually separated by a divider
 * in the dropdown. Put actions that belong together in the same group.
 */
export interface AdaBankActionGroup {
  actions: AdaBankAction[]
}

// ─── Bank registry ────────────────────────────────────────────────────────────

/**
 * Maps a bank abbreviation (extracted from the ADA number) to its action groups.
 *
 * ADA number format: ADA-{BANK}-{FUND}-{PERIOD}-{SEQ}
 * Example: ADA-DBP-GF-062026-001 → bank = 'DBP'
 *
 * To add a new bank:
 *   1. Add an entry here with its action groups.
 *   2. If it needs a new action type, add it to AdaBankActionType above.
 *   3. Handle the new type in the switch inside useAdaBankActions.ts.
 */
export const ADA_BANK_ACTIONS: Record<string, AdaBankActionGroup[]> = {
  DBP: [
    {
      actions: [{ type: 'export-txt', label: 'Export ADA', icon: 'Download' }],
    },
    {
      actions: [
        { type: 'print-prooflist', label: 'Print DBP-Prooflist', icon: 'Printer' },
        { type: 'print-ada', label: 'Print DBP-ADA', icon: 'Printer' },
      ],
    },
  ],

  LBP: [
    {
      actions: [{ type: 'export-csv', label: 'Export CSV', icon: 'Download' }],
    },
  ],

  // ── Add more banks below ──────────────────────────────────────────────────
  // EXAMPLE:
  // LANDBANK: [
  //   { actions: [{ type: 'export-csv', label: 'Export CSV', icon: 'Download' }] },
  // ],
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Extracts the bank abbreviation from an ADA number string.
 * Returns an empty string if the format is not recognised.
 *
 * @example parseBankAbbr('ADA-DBP-GF-062026-001') // 'DBP'
 */
export function parseBankAbbr(adaNumber: string): string {
  return adaNumber.split('-')[1]?.toUpperCase() ?? ''
}
