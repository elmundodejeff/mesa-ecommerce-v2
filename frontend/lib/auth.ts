const TOKEN_KEY = 'mesa_token';
const USER_KEY = 'mesa_user';

export interface UsuarioSesion {
  id: string;
  email: string;
  rol: string;
  nombre: string | null;
  avatar: string | null;
}

export function guardarToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function obtenerToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function guardarUsuario(user: UsuarioSesion) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function obtenerUsuario(): UsuarioSesion | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioSesion;
    } catch {
      return null;
    }
  }
  return null;
}

export function borrarToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}