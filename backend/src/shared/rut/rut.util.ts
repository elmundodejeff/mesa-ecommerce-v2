/**
 * Validacion de RUT chileno (algoritmo modulo 11).
 * Acepta con o sin puntos y con guion. DV puede ser 0-9 o K.
 */
export function validarRut(rutCompleto: string): boolean {
  if (!rutCompleto) return false;

  const limpio = rutCompleto.replace(/[.\-]/g, '').toUpperCase();
  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = 11 - (suma % 11);
  const dvEsperado =
    resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);

  return dv === dvEsperado;
}

/** Normaliza a formato 12345678-9 (sin puntos, con guion). */
export function formatearRut(rutCompleto: string): string {
  const limpio = rutCompleto.replace(/[.\-]/g, '').toUpperCase();
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${cuerpo}-${dv}`;
}