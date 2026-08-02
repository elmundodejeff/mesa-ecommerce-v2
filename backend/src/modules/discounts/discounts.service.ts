import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DiscountsRepository } from './discounts.repository';
import { CreateDescuentoDto } from './dto/create-descuento.dto';
import { UpdateDescuentoDto } from './dto/update-descuento.dto';

export interface ResultadoValidacion {
  valido: boolean;
  motivo?: string;
  tipo?: string;
  valor?: number;
  codigoId?: number;
}

@Injectable()
export class DiscountsService {
  constructor(private readonly repo: DiscountsRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: number) {
    const d = await this.repo.findOne(id);
    if (!d) {
      throw new NotFoundException(`Codigo ${id} no encontrado`);
    }
    return d;
  }

  async create(dto: CreateDescuentoDto) {
    const { userId, ...resto } = dto;
    try {
      return await this.repo.create({
        ...resto,
        vigencia: new Date(dto.vigencia),
        ...(userId ? { user: { connect: { id: userId } } } : {}),
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Ya existe un codigo con ese nombre');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateDescuentoDto) {
    await this.findOne(id);
    const { userId, ...resto } = dto;
    const data: any = { ...resto };
    if (dto.vigencia) {
      data.vigencia = new Date(dto.vigencia);
    }
    if (userId !== undefined) {
      data.user = userId ? { connect: { id: userId } } : { disconnect: true };
    }
    try {
      return await this.repo.update(id, data);
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Ya existe un codigo con ese nombre');
      }
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.remove(id);
  }

  // Calcula el mejor descuento personal (asignado al usuario) segun ahorro
  async mejorDescuentoPersonal(
    userId: string,
    subtotal: number,
  ): Promise<{ codigoId: number; codigo: string; monto: number } | null> {
    const personales = await this.repo.findPersonalesDeUsuario(userId);
    let mejor: { codigoId: number; codigo: string; monto: number } | null = null;
    for (const d of personales) {
      if (d.maxUsos !== null && d.usos >= d.maxUsos) continue;
      // Respetar limite por usuario tambien en el automatico
      if (d.maxUsosPorUsuario !== null) {
        const usados = await this.repo.contarUsosDeUsuario(d.id, userId);
        if (usados >= d.maxUsosPorUsuario) continue;
      }
      let monto =
        d.tipo === "porcentaje"
          ? Math.round((subtotal * d.valor) / 100)
          : d.valor;
      if (monto > subtotal) monto = subtotal;
      if (!mejor || monto > mejor.monto) {
        mejor = { codigoId: d.id, codigo: d.codigo, monto };
      }
    }
    return mejor;
  }

  // Validacion reutilizable: la usara el checkout
  async validar(
    codigo: string,
    userId?: string,
  ): Promise<ResultadoValidacion> {
    const d = await this.repo.findByCodigo(codigo);

    if (!d) {
      return { valido: false, motivo: 'Codigo no existe' };
    }
    if (!d.activo) {
      return { valido: false, motivo: 'Codigo inactivo' };
    }
    if (d.vigencia < new Date()) {
      return { valido: false, motivo: 'Codigo vencido' };
    }
    if (d.maxUsos !== null && d.usos >= d.maxUsos) {
      return { valido: false, motivo: 'Codigo sin usos disponibles' };
    }
    if (d.userId && d.userId !== userId) {
      return { valido: false, motivo: 'Codigo no pertenece a este usuario' };
    }
    // Limite por usuario (requiere estar logueado)
    if (d.maxUsosPorUsuario !== null) {
      if (!userId) {
        return { valido: false, motivo: 'Debes iniciar sesion para usar este codigo' };
      }
      const usados = await this.repo.contarUsosDeUsuario(d.id, userId);
      if (usados >= d.maxUsosPorUsuario) {
        return { valido: false, motivo: 'Ya usaste este codigo el maximo de veces permitido' };
      }
    }

    return {
      valido: true,
      tipo: d.tipo,
      valor: d.valor,
      codigoId: d.id,
    };
  }

  // Endpoint publico para que el front valide antes de pagar
  async validarPublico(codigo: string) {
    const resultado = await this.validar(codigo);
    if (!resultado.valido) {
      throw new BadRequestException(resultado.motivo);
    }
    return resultado;
  }
}