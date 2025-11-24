// Role translation mapping
export const roleTranslations: Record<string, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  CASHIER: 'Caixa',
  VIEWER: 'Visualizador',
};

export function translateRole(role: string): string {
  return roleTranslations[role] || role;
}
