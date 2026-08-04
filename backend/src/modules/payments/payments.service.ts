import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor(private readonly prisma: PrismaService) {
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
}
