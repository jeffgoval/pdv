# 💳 Integração com Gateways de Pagamento

Este guia mostra como integrar os principais gateways de pagamento do Brasil com o sistema POS.

## 🔐 Configuração Inicial

### Armazenar Credenciais

```typescript
// Armazenar na tabela integrations
const { data: integration } = await supabase
  .from('integrations')
  .insert({
    store_id: store.id,
    provider: 'ASAAS',
    name: 'Asaas Payment Gateway',
    api_key: process.env.ASAAS_API_KEY,
    config: {
      environment: 'production', // ou 'sandbox'
      webhook_url: 'https://seuapp.com/api/webhooks/asaas',
    },
    is_active: true,
  })
  .select()
  .single();
```

## 1️⃣ Asaas

### Criar Cobrança PIX

```typescript
// lib/payment/asaas.ts
interface AsaasConfig {
  apiKey: string;
  environment: 'production' | 'sandbox';
}

class AsaasPayment {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: AsaasConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/api/v3';
  }

  async createPixPayment(data: {
    value: number;
    customer: {
      name: string;
      cpfCnpj: string;
      email?: string;
      phone?: string;
    };
    externalReference?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: this.apiKey,
      },
      body: JSON.stringify({
        billingType: 'PIX',
        value: data.value,
        dueDate: new Date().toISOString().split('T')[0],
        customer: data.customer,
        externalReference: data.externalReference,
        description: 'Venda via POS',
      }),
    });

    return await response.json();
  }

  async getPixQrCode(paymentId: string) {
    const response = await fetch(
      `${this.baseUrl}/payments/${paymentId}/pixQrCode`,
      {
        headers: {
          'Content-Type': 'application/json',
          access_token: this.apiKey,
        },
      }
    );

    return await response.json();
  }

  async createCreditCardPayment(data: {
    value: number;
    installmentCount: number;
    customer: {
      name: string;
      cpfCnpj: string;
      email: string;
      phone: string;
      postalCode: string;
      addressNumber: string;
    };
    creditCard: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    creditCardHolderInfo: {
      name: string;
      cpfCnpj: string;
      postalCode: string;
      addressNumber: string;
      phone: string;
    };
  }) {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: this.apiKey,
      },
      body: JSON.stringify({
        billingType: 'CREDIT_CARD',
        value: data.value,
        dueDate: new Date().toISOString().split('T')[0],
        customer: data.customer,
        installmentCount: data.installmentCount,
        creditCard: data.creditCard,
        creditCardHolderInfo: data.creditCardHolderInfo,
      }),
    });

    return await response.json();
  }
}

// Uso
export async function processAsaasPayment(
  saleId: string,
  paymentMethod: 'PIX' | 'CREDIT_CARD'
) {
  // 1. Buscar credenciais
  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('provider', 'ASAAS')
    .single();

  if (!integration?.is_active) {
    throw new Error('Asaas integration not configured');
  }

  const asaas = new AsaasPayment({
    apiKey: integration.api_key!,
    environment: integration.config.environment,
  });

  // 2. Buscar venda
  const { data: sale } = await supabase
    .from('sales')
    .select('*, customer:customers(*)')
    .eq('id', saleId)
    .single();

  if (!sale) throw new Error('Sale not found');

  // 3. Criar cobrança
  if (paymentMethod === 'PIX') {
    const payment = await asaas.createPixPayment({
      value: sale.total,
      customer: {
        name: sale.customer.name,
        cpfCnpj: sale.customer.cpf || '',
        email: sale.customer.email,
        phone: sale.customer.phone,
      },
      externalReference: sale.id,
    });

    // 4. Buscar QR Code
    const pixData = await asaas.getPixQrCode(payment.id);

    // 5. Salvar pagamento no banco
    await supabase.from('payments').insert({
      sale_id: saleId,
      amount: sale.total,
      method: 'PIX',
      status: 'PENDING',
      provider: 'ASAAS',
      external_id: payment.id,
      pix_qr_code: pixData.encodedImage,
      pix_copy_paste: pixData.payload,
      pix_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      payload: { payment, pixData },
    });

    return { payment, pixData };
  }
}
```

### Webhook Asaas

```typescript
// pages/api/webhooks/asaas.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhook = req.body;

  try {
    // Validar assinatura do webhook (importante!)
    const { data: integration } = await supabase
      .from('integrations')
      .select('webhook_secret')
      .eq('provider', 'ASAAS')
      .single();

    // Validação de assinatura aqui...

    // Processar diferentes tipos de eventos
    switch (webhook.event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        await handlePaymentConfirmed(webhook.payment);
        break;

      case 'PAYMENT_OVERDUE':
        await handlePaymentOverdue(webhook.payment);
        break;

      case 'PAYMENT_DELETED':
        await handlePaymentCancelled(webhook.payment);
        break;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePaymentConfirmed(paymentData: any) {
  // 1. Buscar pagamento pelo external_id
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('external_id', paymentData.id)
    .single();

  if (!payment) {
    console.error('Payment not found:', paymentData.id);
    return;
  }

  // 2. Atualizar pagamento
  await supabase
    .from('payments')
    .update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      payload: paymentData,
    })
    .eq('id', payment.id);

  // 3. Processar pagamento (atualiza venda e estoque)
  await supabase.rpc('process_payment', { payment_uuid: payment.id });

  // 4. Criar notificação
  const { data: sale } = await supabase
    .from('sales')
    .select('store_id, cashier_id')
    .eq('id', payment.sale_id)
    .single();

  await supabase.from('notifications').insert({
    user_id: sale.cashier_id,
    store_id: sale.store_id,
    type: 'PAYMENT',
    title: 'Pagamento Confirmado',
    message: `Pagamento de R$ ${payment.amount} confirmado via ${payment.method}`,
    action_url: `/sales/${payment.sale_id}`,
  });
}

async function handlePaymentOverdue(paymentData: any) {
  await supabase
    .from('payments')
    .update({ status: 'FAILED' })
    .eq('external_id', paymentData.id);
}

async function handlePaymentCancelled(paymentData: any) {
  await supabase
    .from('payments')
    .update({
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
    })
    .eq('external_id', paymentData.id);
}
```

## 2️⃣ Mercado Pago

### Criar Preferência de Pagamento

```typescript
// lib/payment/mercadopago.ts
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

class MercadoPagoPayment {
  private client: MercadoPagoConfig;
  private preference: Preference;

  constructor(accessToken: string) {
    this.client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    });
    this.preference = new Preference(this.client);
  }

  async createPaymentPreference(data: {
    title: string;
    quantity: number;
    unitPrice: number;
    customerId?: string;
    customerEmail?: string;
    externalReference: string;
  }) {
    const preference = await this.preference.create({
      body: {
        items: [
          {
            title: data.title,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: data.customerEmail,
        },
        external_reference: data.externalReference,
        notification_url: 'https://seuapp.com/api/webhooks/mercadopago',
        back_urls: {
          success: 'https://seuapp.com/payment/success',
          failure: 'https://seuapp.com/payment/failure',
          pending: 'https://seuapp.com/payment/pending',
        },
        auto_return: 'approved',
      },
    });

    return preference;
  }

  async createPixPayment(data: {
    amount: number;
    description: string;
    payerEmail: string;
    externalReference: string;
  }) {
    const payment = new Payment(this.client);

    const result = await payment.create({
      body: {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: 'pix',
        payer: {
          email: data.payerEmail,
        },
        external_reference: data.externalReference,
      },
    });

    return result;
  }
}

// Uso
export async function createMercadoPagoPayment(saleId: string) {
  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('provider', 'MERCADOPAGO')
    .single();

  const mp = new MercadoPagoPayment(integration.api_key!);

  const { data: sale } = await supabase
    .from('sales')
    .select('*, customer:customers(*)')
    .eq('id', saleId)
    .single();

  const payment = await mp.createPixPayment({
    amount: sale.total,
    description: `Venda #${sale.sale_number}`,
    payerEmail: sale.customer.email,
    externalReference: sale.id,
  });

  await supabase.from('payments').insert({
    sale_id: saleId,
    amount: sale.total,
    method: 'PIX',
    status: 'PENDING',
    provider: 'MERCADOPAGO',
    external_id: payment.id?.toString(),
    pix_qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
    pix_copy_paste:
      payment.point_of_interaction?.transaction_data?.qr_code_base64,
    payload: payment,
  });

  return payment;
}
```

### Webhook Mercado Pago

```typescript
// pages/api/webhooks/mercadopago.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  try {
    if (type === 'payment') {
      // Buscar detalhes do pagamento na API do Mercado Pago
      const paymentId = data.id;

      const { data: integration } = await supabase
        .from('integrations')
        .select('api_key')
        .eq('provider', 'MERCADOPAGO')
        .single();

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${integration.api_key}`,
          },
        }
      );

      const paymentData = await response.json();

      if (paymentData.status === 'approved') {
        await handlePaymentApproved(paymentData);
      } else if (paymentData.status === 'rejected') {
        await handlePaymentRejected(paymentData);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePaymentApproved(paymentData: any) {
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('external_id', paymentData.id.toString())
    .single();

  if (!payment) return;

  await supabase
    .from('payments')
    .update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      payload: paymentData,
    })
    .eq('id', payment.id);

  await supabase.rpc('process_payment', { payment_uuid: payment.id });
}

async function handlePaymentRejected(paymentData: any) {
  await supabase
    .from('payments')
    .update({ status: 'FAILED' })
    .eq('external_id', paymentData.id.toString());
}
```

## 3️⃣ PagSeguro

### Criar Cobrança

```typescript
// lib/payment/pagseguro.ts
class PagSeguroPayment {
  private token: string;
  private baseUrl: string;

  constructor(token: string, sandbox: boolean = false) {
    this.token = token;
    this.baseUrl = sandbox
      ? 'https://sandbox.api.pagseguro.com'
      : 'https://api.pagseguro.com';
  }

  async createPixCharge(data: {
    referenceId: string;
    amount: number;
    customer: {
      name: string;
      email: string;
      taxId: string;
      phone: string;
    };
  }) {
    const response = await fetch(`${this.baseUrl}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        reference_id: data.referenceId,
        amount: {
          value: Math.round(data.amount * 100), // em centavos
          currency: 'BRL',
        },
        payment_method: {
          type: 'PIX',
        },
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          tax_id: data.customer.taxId,
          phones: [
            {
              country: '55',
              area: data.customer.phone.substring(0, 2),
              number: data.customer.phone.substring(2),
            },
          ],
        },
        notification_urls: ['https://seuapp.com/api/webhooks/pagseguro'],
      }),
    });

    return await response.json();
  }

  async getChargeDetails(chargeId: string) {
    const response = await fetch(`${this.baseUrl}/charges/${chargeId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    return await response.json();
  }
}

// Uso
export async function createPagSeguroPayment(saleId: string) {
  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('provider', 'PAGSEGURO')
    .single();

  const pagseguro = new PagSeguroPayment(
    integration.api_key!,
    integration.config.environment === 'sandbox'
  );

  const { data: sale } = await supabase
    .from('sales')
    .select('*, customer:customers(*)')
    .eq('id', saleId)
    .single();

  const charge = await pagseguro.createPixCharge({
    referenceId: sale.id,
    amount: sale.total,
    customer: {
      name: sale.customer.name,
      email: sale.customer.email,
      taxId: sale.customer.cpf,
      phone: sale.customer.phone,
    },
  });

  await supabase.from('payments').insert({
    sale_id: saleId,
    amount: sale.total,
    method: 'PIX',
    status: 'PENDING',
    provider: 'PAGSEGURO',
    external_id: charge.id,
    pix_qr_code: charge.qr_codes?.[0]?.links?.[0]?.href,
    pix_copy_paste: charge.qr_codes?.[0]?.text,
    payload: charge,
  });

  return charge;
}
```

## 🔄 Componente React Universal

```typescript
// components/PaymentProcessor.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PaymentProcessorProps {
  saleId: string;
  amount: number;
  provider: 'ASAAS' | 'MERCADOPAGO' | 'PAGSEGURO';
}

export function PaymentProcessor({ saleId, amount, provider }: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  async function generatePix() {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleId,
          method: 'PIX',
          provider
        })
      });

      const data = await response.json();
      setPixData(data);

      // Iniciar polling para verificar pagamento
      startPaymentPolling(data.payment.id);
    } catch (error) {
      console.error('Error generating PIX:', error);
    } finally {
      setLoading(false);
    }
  }

  function startPaymentPolling(paymentId: string) {
    const interval = setInterval(async () => {
      const { data: payment } = await supabase
        .from('payments')
        .select('status')
        .eq('id', paymentId)
        .single();

      if (payment?.status === 'PAID') {
        clearInterval(interval);
        alert('Pagamento confirmado!');
        window.location.href = `/sales/${saleId}`;
      }
    }, 3000); // Verificar a cada 3 segundos

    // Limpar após 10 minutos
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
  }

  return (
    <div className="p-4">
      <h2>Pagamento - R$ {amount.toFixed(2)}</h2>

      {!pixData ? (
        <button
          onClick={generatePix}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Gerando PIX...' : 'Pagar com PIX'}
        </button>
      ) : (
        <div className="mt-4">
          <h3>Escaneie o QR Code:</h3>
          <img src={pixData.pixQrCode} alt="QR Code PIX" />

          <h3 className="mt-4">Ou copie o código:</h3>
          <div className="flex gap-2">
            <input
              readOnly
              value={pixData.pixCopyPaste}
              className="flex-1"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(pixData.pixCopyPaste);
                alert('Código copiado!');
              }}
            >
              Copiar
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Aguardando confirmação do pagamento...
          </p>
        </div>
      )}
    </div>
  );
}
```

## 🔐 Segurança

### Validação de Webhooks

```typescript
// lib/webhook-validator.ts
import crypto from 'crypto';

export function validateAsaasWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

export function validateMercadoPagoWebhook(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): boolean {
  const parts = xSignature.split(',');
  const ts = parts[0].split('=')[1];
  const hash = parts[1].split('=')[1];

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return hmac === hash;
}
```

## 📊 Monitoramento

```typescript
// Criar tabela para logs de webhook
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  headers jsonb,
  processed boolean DEFAULT false,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

// Salvar todos os webhooks
async function logWebhook(provider: string, eventType: string, payload: any, headers: any) {
  await supabase
    .from('webhook_logs')
    .insert({
      provider,
      event_type: eventType,
      payload,
      headers
    });
}
```

Esses exemplos cobrem os principais gateways de pagamento do Brasil e podem ser adaptados para outros provedores!
