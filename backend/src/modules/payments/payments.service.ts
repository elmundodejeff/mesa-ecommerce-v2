import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { PrismaService } from '../../shared/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      throw new Error('MP_ACCESS_TOKEN no esta definido en el .env');
    }
    this.client = new MercadoPagoConfig({ accessToken: token });
  }

  async crearPreferencia(ordenId: number) {
    const orden = await this.prisma.orden.findUnique({
      where: { id: ordenId },
      include: { items: true },
    });

    if (!orden) {
      throw new NotFoundException(`Orden ${ordenId} no encontrada`);
    }
    if (orden.total <= 0) {
      throw new BadRequestException('El total de la orden debe ser mayor a 0');
    }

    const frontUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const backUrl = process.env.PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

    const preference = new Preference(this.client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: String(orden.id),
            title: `Orden #${orden.id} - Mesa`,
            quantity: 1,
            unit_price: orden.total,
            currency_id: 'CLP',
          },
        ],
        external_reference: String(orden.id),
        back_urls: {
          success: `${frontUrl}/checkout/resultado?estado=success`,
          failure: `${frontUrl}/checkout/resultado?estado=failure`,
          pending: `${frontUrl}/checkout/resultado?estado=pending`,
        },
        notification_url: `${backUrl}/payments/webhook`,
      },
    });

    await this.prisma.orden.update({
      where: { id: orden.id },
      data: { mpPreferenceId: result.id },
    });

    return {
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    };
  }

  // Procesa la notificacion (webhook) de MercadoPago.
  // MP envia el id del pago; consultamos su estado y confirmamos/cancelamos la orden.
  async procesarWebhook(query: any, body: any) {
    // MP puede mandar el id de distintas formas segun el tipo de evento.
    const tipo = query?.type ?? body?.type;
    const paymentId =
      query?.['data.id'] ?? body?.data?.id ?? query?.id ?? null;

    // Solo nos interesan eventos de pago.
    if (tipo && tipo !== 'payment') return { ignored: true };
    if (!paymentId) return { ignored: true };

    // Consultar el pago real en la API de MP.
    const payment = new Payment(this.client);
    let info: any;
    try {
      info = await payment.get({ id: String(paymentId) });
    } catch {
      return { ignored: true };
    }

    const estado = info?.status; // approved | rejected | pending | cancelled ...
    const ordenId = Number(info?.external_reference);
    if (!ordenId) return { ignored: true };

    if (estado === 'approved') {
      await this.orders.confirmarPago(ordenId, String(paymentId));
      return { ok: true, estado };
    }

    if (estado === 'rejected' || estado === 'cancelled') {
      await this.orders.cancelarOrden(ordenId);
      return { ok: true, estado };
    }

    // pending u otros: no hacemos nada, la orden sigue pendiente hasta expirar.
    return { ok: true, estado };
  }
}
